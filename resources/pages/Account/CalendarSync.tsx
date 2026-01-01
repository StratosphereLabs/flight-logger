/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/no-confusing-void-expression */
/* eslint-disable react/no-unescaped-entities */
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { trpc } from '../../utils/trpc';

const addCalendarSchema = z.object({
  url: z.string().url('Must be a valid URL'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
});

type AddCalendarForm = z.infer<typeof addCalendarSchema>;

interface SyncResult {
  calendarId: string;
  calendarName: string;
  totalEventsFound: number;
  totalFutureEvents: number;
  totalFutureFlights: number;
  newPendingFlights: number;
  autoImportedFlights: number;
  autoImportFailures: number;
  skippedAlreadyPending: number;
  skippedAlreadyImported: number;
  skippedRecentlyRejected: number;
  errors: string[];
  detectedFlights: Array<{
    summary: string;
    airline?: string;
    flightNumber?: number;
    departure?: string;
    arrival?: string;
    date?: string;
    status: string;
    pendingFlightId?: string;
  }>;
}

interface BackgroundSyncResult {
  calendarId: string;
  calendarName: string;
  backgroundSync: true;
  message: string;
}

type SyncResponse = SyncResult | BackgroundSyncResult;

const isBackgroundSync = (
  result: SyncResponse,
): result is BackgroundSyncResult =>
  'backgroundSync' in result && result.backgroundSync;

export const CalendarSync = (): JSX.Element => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [backgroundSyncMessage, setBackgroundSyncMessage] = useState<
    string | null
  >(null);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [restoringFlightId, setRestoringFlightId] = useState<string | null>(
    null,
  );

  const { data: calendars, refetch } =
    trpc.calendars.getCalendarSources.useQuery();
  const addCalendarMutation = trpc.calendars.addCalendarSource.useMutation();
  const updateCalendarMutation =
    trpc.calendars.updateCalendarSource.useMutation();
  const deleteCalendarMutation =
    trpc.calendars.deleteCalendarSource.useMutation();
  const testSyncMutation = trpc.calendars.testCalendarSync.useMutation();
  const restoreMutation = trpc.calendars.restorePendingFlight.useMutation();

  // Track if we've already triggered background sync on mount
  const hasTriggeredBackgroundSync = useRef(false);

  // Trigger background sync for auto-import calendars on page load
  useEffect(() => {
    if (
      calendars !== undefined &&
      calendars.length > 0 &&
      !hasTriggeredBackgroundSync.current
    ) {
      hasTriggeredBackgroundSync.current = true;

      // Find all enabled calendars with auto-import
      const autoImportCalendars = calendars.filter(
        cal => cal.enabled && cal.autoImport,
      );

      // Trigger background sync for each (fire and forget)
      for (const calendar of autoImportCalendars) {
        testSyncMutation.mutate({ id: calendar.id });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calendars]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddCalendarForm>({
    resolver: zodResolver(addCalendarSchema),
  });

  const onAddCalendar = async (data: AddCalendarForm) => {
    try {
      await addCalendarMutation.mutateAsync(data);
      reset();
      setShowAddForm(false);
      refetch();
    } catch (error) {
      console.error('Failed to add calendar:', error);
    }
  };

  const toggleCalendar = async (id: string, enabled: boolean) => {
    try {
      await updateCalendarMutation.mutateAsync({ id, enabled });
      refetch();
    } catch (error) {
      console.error('Failed to update calendar:', error);
    }
  };

  const toggleAutoImport = async (id: string, autoImport: boolean) => {
    try {
      await updateCalendarMutation.mutateAsync({ id, autoImport });
      refetch();
    } catch (error) {
      console.error('Failed to update auto-import setting:', error);
    }
  };

  const deleteCalendar = async (id: string) => {
    if (!confirm('Are you sure you want to delete this calendar?')) return;

    try {
      await deleteCalendarMutation.mutateAsync({ id });
      refetch();
    } catch (error) {
      console.error('Failed to delete calendar:', error);
    }
  };

  const testSync = async (id: string) => {
    setSyncing(id);
    setSyncResult(null);
    setSyncError(null);
    setBackgroundSyncMessage(null);

    try {
      const result = (await testSyncMutation.mutateAsync({
        id,
      })) as SyncResponse;

      if (isBackgroundSync(result)) {
        // Auto-import calendar - sync is running in background
        setBackgroundSyncMessage(result.message);
      } else {
        // Non-auto-import calendar - show detailed results
        setSyncResult(result);
      }
      refetch();
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncError(
        error instanceof Error ? error.message : 'Sync failed. Check console.',
      );
    } finally {
      setSyncing(null);
    }
  };

  const restoreRejectedFlight = async (pendingFlightId: string) => {
    setRestoringFlightId(pendingFlightId);
    try {
      await restoreMutation.mutateAsync({ id: pendingFlightId });
      // Update the sync result to show the flight is now pending
      if (syncResult) {
        setSyncResult({
          ...syncResult,
          skippedRecentlyRejected: syncResult.skippedRecentlyRejected - 1,
          newPendingFlights: syncResult.newPendingFlights + 1,
          detectedFlights: syncResult.detectedFlights.map(flight =>
            flight.pendingFlightId === pendingFlightId
              ? { ...flight, status: 'restored' }
              : flight,
          ),
        });
      }
    } catch (error) {
      console.error('Failed to restore flight:', error);
    } finally {
      setRestoringFlightId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'created':
        return <span className="badge badge-success badge-sm">New</span>;
      case 'auto_imported':
        return (
          <span className="badge badge-primary badge-sm">Auto-imported</span>
        );
      case 'auto_import_failed':
        return (
          <span className="badge badge-warning badge-sm">Import Failed</span>
        );
      case 'already_pending':
        return <span className="badge badge-warning badge-sm">Pending</span>;
      case 'already_imported':
        return <span className="badge badge-info badge-sm">Imported</span>;
      case 'recently_rejected':
        return <span className="badge badge-error badge-sm">Rejected</span>;
      case 'restored':
        return <span className="badge badge-success badge-sm">Restored</span>;
      default:
        return <span className="badge badge-ghost badge-sm">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex items-center justify-between">
            <h3 className="card-title">Calendar Sync</h3>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              {showAddForm ? 'Cancel' : 'Add Calendar'}
            </button>
          </div>

          {showAddForm && (
            <form onSubmit={handleSubmit(onAddCalendar)} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Calendar Name</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  {...register('name')}
                  placeholder="e.g., My Flight Calendar"
                />
                {errors.name && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {errors.name.message}
                    </span>
                  </label>
                )}
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">iCal URL</span>
                </label>
                <input
                  type="url"
                  className="input input-bordered"
                  {...register('url')}
                  placeholder="https://calendar.google.com/calendar/ical/.../basic.ics"
                />
                {errors.url && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {errors.url.message}
                    </span>
                  </label>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={addCalendarMutation.isLoading}
                >
                  {addCalendarMutation.isLoading ? 'Adding...' : 'Add Calendar'}
                </button>
              </div>
            </form>
          )}

          <div className="space-y-4">
            {calendars?.length === 0 ? (
              <p className="text-base-content/60">
                No calendars configured yet.
              </p>
            ) : (
              calendars?.map(
                (calendar: NonNullable<typeof calendars>[number]) => (
                  <div
                    key={calendar.id}
                    className="border-base-300 rounded-lg border p-4"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{calendar.name}</h4>
                        <p className="text-base-content/60 max-w-md truncate text-sm">
                          {calendar.url}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => testSync(calendar.id)}
                          disabled={syncing === calendar.id}
                        >
                          {syncing === calendar.id ? (
                            <>
                              <span className="loading loading-spinner loading-xs"></span>
                              Syncing...
                            </>
                          ) : (
                            'Test Sync'
                          )}
                        </button>
                        <button
                          className="btn btn-ghost btn-sm text-error"
                          onClick={() => deleteCalendar(calendar.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <label className="flex cursor-pointer items-center gap-2">
                        <input
                          type="checkbox"
                          className="toggle toggle-primary toggle-sm"
                          checked={calendar.enabled}
                          onChange={e =>
                            toggleCalendar(calendar.id, e.target.checked)
                          }
                        />
                        <span>Enabled</span>
                      </label>
                      <label
                        className="flex cursor-pointer items-center gap-2"
                        title="When enabled, flights will be automatically imported without review. If auto-import fails, flights will be added to pending for manual review."
                      >
                        <input
                          type="checkbox"
                          className="toggle toggle-secondary toggle-sm"
                          checked={calendar.autoImport}
                          onChange={e =>
                            toggleAutoImport(calendar.id, e.target.checked)
                          }
                        />
                        <span>Auto-import</span>
                        <span className="text-base-content/50 text-xs">
                          (skip review)
                        </span>
                      </label>
                    </div>

                    {calendar.lastSyncAt && (
                      <p className="text-base-content/50 text-xs">
                        Last synced:{' '}
                        {new Date(calendar.lastSyncAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                ),
              )
            )}
          </div>

          <div className="alert alert-info mt-4 flex items-start">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="mt-1 h-6 w-6 shrink-0 stroke-current"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <div>
              <h3 className="font-bold">How to find your Secret Address</h3>
              <div className="mt-2 space-y-1 text-xs">
                <p>
                  <strong>Step 1:</strong> In Google Calendar, click the gear
                  icon ⚙️ &gt; <strong>Settings</strong>.
                </p>
                <p>
                  <strong>Step 2:</strong> Under{' '}
                  <strong>Settings for my calendars</strong>, select your
                  calendar.
                </p>
                <p>
                  <strong>Step 3:</strong> Scroll down to the{' '}
                  <strong>Integrate calendar</strong> section.
                </p>
                <p>
                  <strong>Step 4:</strong> Copy the{' '}
                  <strong>Secret address in iCal format</strong>.
                </p>
                <p className="mt-2 text-[10px] italic opacity-80">
                  Note: Do not use the Public address.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sync Error */}
      {syncError !== null && (
        <div className="alert alert-error">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 shrink-0 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <h3 className="font-bold">Sync Failed</h3>
            <div className="text-sm">{syncError}</div>
          </div>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setSyncError(null)}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Background Sync Started */}
      {backgroundSyncMessage !== null && (
        <div className="alert alert-info">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="h-6 w-6 shrink-0 stroke-current"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <div>
            <h3 className="font-bold">Background Sync Started</h3>
            <div className="text-sm">{backgroundSyncMessage}</div>
          </div>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setBackgroundSyncMessage(null)}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Sync Results */}
      {syncResult && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <h3 className="card-title">
                Sync Results: {syncResult.calendarName}
              </h3>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setSyncResult(null)}
              >
                Close
              </button>
            </div>

            {/* Stats */}
            <div className="stats stats-vertical lg:stats-horizontal shadow">
              <div className="stat">
                <div className="stat-title">Total Events</div>
                <div className="stat-value text-2xl">
                  {syncResult.totalEventsFound}
                </div>
              </div>
              <div className="stat">
                <div className="stat-title">Future Events</div>
                <div className="stat-value text-2xl">
                  {syncResult.totalFutureEvents}
                </div>
              </div>
              <div className="stat">
                <div className="stat-title">Flights Detected</div>
                <div className="stat-value text-2xl">
                  {syncResult.totalFutureFlights}
                </div>
              </div>
              {syncResult.autoImportedFlights > 0 && (
                <div className="stat">
                  <div className="stat-title">Auto-imported</div>
                  <div className="stat-value text-primary text-2xl">
                    {syncResult.autoImportedFlights}
                  </div>
                </div>
              )}
              {syncResult.newPendingFlights > 0 && (
                <div className="stat">
                  <div className="stat-title">New Pending</div>
                  <div className="stat-value text-success text-2xl">
                    {syncResult.newPendingFlights}
                  </div>
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-3 lg:grid-cols-6">
              {syncResult.autoImportedFlights > 0 && (
                <div className="bg-primary/10 rounded-lg p-3">
                  <div className="text-primary font-semibold">
                    Auto-imported
                  </div>
                  <div className="text-2xl">
                    {syncResult.autoImportedFlights}
                  </div>
                </div>
              )}
              {syncResult.autoImportFailures > 0 && (
                <div className="bg-warning/10 rounded-lg p-3">
                  <div className="text-warning font-semibold">
                    Import Failed
                  </div>
                  <div className="text-2xl">
                    {syncResult.autoImportFailures}
                  </div>
                </div>
              )}
              <div className="bg-success/10 rounded-lg p-3">
                <div className="text-success font-semibold">New Pending</div>
                <div className="text-2xl">{syncResult.newPendingFlights}</div>
              </div>
              <div className="bg-base-200 rounded-lg p-3">
                <div className="text-base-content/70 font-semibold">
                  Already Pending
                </div>
                <div className="text-2xl">
                  {syncResult.skippedAlreadyPending}
                </div>
              </div>
              <div className="bg-info/10 rounded-lg p-3">
                <div className="text-info font-semibold">Already Imported</div>
                <div className="text-2xl">
                  {syncResult.skippedAlreadyImported}
                </div>
              </div>
              <div className="bg-error/10 rounded-lg p-3">
                <div className="text-error font-semibold">
                  Recently Rejected
                </div>
                <div className="text-2xl">
                  {syncResult.skippedRecentlyRejected}
                </div>
              </div>
            </div>

            {/* Errors */}
            {syncResult.errors.length > 0 && (
              <div className="alert alert-warning">
                <div>
                  <h4 className="font-semibold">Warnings/Errors:</h4>
                  <ul className="list-inside list-disc text-sm">
                    {syncResult.errors.map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Detected Flights Table */}
            {syncResult.detectedFlights &&
              syncResult.detectedFlights.length > 0 && (
                <div>
                  <h4 className="mb-2 font-semibold">Detected Flights</h4>
                  <div className="overflow-x-auto">
                    <table className="table-zebra table-sm table">
                      <thead>
                        <tr>
                          <th>Flight</th>
                          <th>Route</th>
                          <th>Date</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {syncResult.detectedFlights.map((flight, i) => (
                          <tr key={i}>
                            <td>
                              <div className="font-medium">
                                {flight.airline ?? '??'}
                                {flight.flightNumber ?? '?'}
                              </div>
                              <div className="text-base-content/60 max-w-xs truncate text-xs">
                                {flight.summary}
                              </div>
                            </td>
                            <td>
                              {flight.departure ?? '???'} -{' '}
                              {flight.arrival ?? '???'}
                            </td>
                            <td>{flight.date ?? 'Unknown'}</td>
                            <td>{getStatusBadge(flight.status)}</td>
                            <td>
                              {flight.status === 'recently_rejected' &&
                                flight.pendingFlightId && (
                                  <button
                                    className="btn btn-ghost btn-xs"
                                    onClick={() =>
                                      restoreRejectedFlight(
                                        flight.pendingFlightId!,
                                      )
                                    }
                                    disabled={
                                      restoringFlightId ===
                                      flight.pendingFlightId
                                    }
                                  >
                                    {restoringFlightId ===
                                    flight.pendingFlightId ? (
                                      <span className="loading loading-spinner loading-xs"></span>
                                    ) : (
                                      'Add Anyway'
                                    )}
                                  </button>
                                )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            {(!syncResult.detectedFlights ||
              syncResult.detectedFlights.length === 0) &&
              syncResult.totalFutureEvents > 0 && (
                <div className="alert">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="h-6 w-6 shrink-0 stroke-current"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  <span>
                    No flights detected in {syncResult.totalFutureEvents} future
                    events. Make sure your calendar events contain flight
                    information (airline code, flight number, airports).
                  </span>
                </div>
              )}

            {syncResult.totalEventsFound === 0 && (
              <div className="alert alert-warning">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 shrink-0 stroke-current"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <span>
                  No events found in this calendar. Make sure the iCal URL is
                  correct and the calendar is accessible. If using Google
                  Calendar, use the "Secret address in iCal format" instead of
                  the public URL.
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
