/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/no-confusing-void-expression */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { trpc } from '../../utils/trpc';

const editFlightSchema = z.object({
  airlineId: z.string().uuid().optional(),
  flightNumber: z.number().int().positive().optional(),
  departureAirportId: z.string().optional(),
  arrivalAirportId: z.string().optional(),
  outTime: z.string().datetime().optional(),
  inTime: z.string().datetime().optional(),
});

type EditFlightForm = z.infer<typeof editFlightSchema>;

interface PendingFlight {
  id: string;
  calendarSource: {
    name: string;
    url: string;
  };
  parsedData: {
    airline?: string;
    flightNumber?: number;
    departureAirport?: string;
    arrivalAirport?: string;
    outTime?: Date;
    inTime?: Date;
    rawSummary: string;
  };
  detectedAt: string;
}

interface PendingFlightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  pendingFlights: PendingFlight[];
  onFlightsUpdated: () => void;
}

type SortField = 'date' | 'airline' | 'calendar' | 'route';
type SortOrder = 'asc' | 'desc';

export const PendingFlightsModal = ({
  isOpen,
  onClose,
  pendingFlights,
  onFlightsUpdated,
}: PendingFlightsModalProps): JSX.Element | null => {
  const [selectedFlightIds, setSelectedFlightIds] = useState<Set<string>>(
    new Set(),
  );
  const [editingFlightId, setEditingFlightId] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sorting and filtering state
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [filterAirline, setFilterAirline] = useState<string>('');
  const [filterCalendar, setFilterCalendar] = useState<string>('');

  const approveMutation = trpc.calendars.approvePendingFlight.useMutation();
  const rejectMutation = trpc.calendars.rejectPendingFlight.useMutation();
  const bulkApproveMutation =
    trpc.calendars.bulkApprovePendingFlights.useMutation();
  const bulkRejectMutation =
    trpc.calendars.bulkRejectPendingFlights.useMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditFlightForm>({
    resolver: zodResolver(editFlightSchema),
  });

  // Derived state for filtered/sorted flights
  const processedFlights = useMemo(() => {
    let result = [...pendingFlights];

    // Filter by airline
    if (filterAirline) {
      result = result.filter(
        f =>
          (f.parsedData.airline ?? 'Unknown') === filterAirline ||
          (f.parsedData.rawSummary ?? '').includes(filterAirline),
      );
    }

    // Filter by calendar
    if (filterCalendar) {
      result = result.filter(f => f.calendarSource.name === filterCalendar);
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'date':
          comparison =
            new Date(a.parsedData.outTime ?? 0).getTime() -
            new Date(b.parsedData.outTime ?? 0).getTime();
          break;
        case 'airline':
          comparison = (a.parsedData.airline ?? '').localeCompare(
            b.parsedData.airline ?? '',
          );
          break;
        case 'calendar':
          comparison = a.calendarSource.name.localeCompare(
            b.calendarSource.name,
          );
          break;
        case 'route': {
          const routeA = `${a.parsedData.departureAirport ?? ''}-${a.parsedData.arrivalAirport ?? ''}`;
          const routeB = `${b.parsedData.departureAirport ?? ''}-${b.parsedData.arrivalAirport ?? ''}`;
          comparison = routeA.localeCompare(routeB);
          break;
        }
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [pendingFlights, filterAirline, filterCalendar, sortField, sortOrder]);

  // Unique values for filters
  const uniqueAirlines = useMemo(() => {
    const airlines = new Set<string>();
    pendingFlights.forEach(f => {
      if (f.parsedData.airline) airlines.add(f.parsedData.airline);
    });
    return Array.from(airlines).sort();
  }, [pendingFlights]);

  const uniqueCalendars = useMemo(() => {
    const cals = new Set<string>();
    pendingFlights.forEach(f => cals.add(f.calendarSource.name));
    return Array.from(cals).sort();
  }, [pendingFlights]);

  // Selection handlers
  const handleSelectAll = () => {
    if (selectedFlightIds.size === processedFlights.length) {
      setSelectedFlightIds(new Set());
    } else {
      setSelectedFlightIds(new Set(processedFlights.map(f => f.id)));
    }
  };

  const handleToggleFlight = (id: string) => {
    const newSelected = new Set(selectedFlightIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedFlightIds(newSelected);
  };

  // Bulk actions
  const handleBulkApprove = async () => {
    const idsToProcess =
      selectedFlightIds.size > 0
        ? Array.from(selectedFlightIds)
        : processedFlights.map(f => f.id);

    setProcessing(true);
    setError(null);
    try {
      const results = await bulkApproveMutation.mutateAsync({
        ids: idsToProcess,
      });

      const failures = results.filter((r: any) => !r.success);
      if (failures.length > 0) {
        setError(
          `${failures.length} flight(s) failed to add. Check console for details.`,
        );
        console.error('Bulk approve failures:', failures);
      }
      onFlightsUpdated();
      setSelectedFlightIds(new Set());
      if (
        failures.length === 0 &&
        processedFlights.length === idsToProcess.length
      ) {
        onClose();
      }
    } catch (err) {
      console.error('Failed to bulk approve flights:', err);
      const message =
        err instanceof Error ? err.message : 'Failed to add flights';
      setError(message);
    } finally {
      setProcessing(false);
    }
  };

  const handleBulkReject = async () => {
    const idsToProcess =
      selectedFlightIds.size > 0
        ? Array.from(selectedFlightIds)
        : processedFlights.map(f => f.id);

    if (!confirm(`Reject ${idsToProcess.length} pending flight(s)?`)) return;

    setProcessing(true);
    try {
      await bulkRejectMutation.mutateAsync({
        ids: idsToProcess,
      });
      onFlightsUpdated();
      setSelectedFlightIds(new Set());
      if (processedFlights.length === idsToProcess.length) {
        onClose();
      }
    } catch (error) {
      console.error('Failed to bulk reject flights:', error);
    } finally {
      setProcessing(false);
    }
  };

  // Individual actions
  const handleApproveSingle = async (id: string, data: EditFlightForm = {}) => {
    setProcessing(true);
    setError(null);
    try {
      await approveMutation.mutateAsync({
        id,
        ...data,
      });
      onFlightsUpdated();
      setEditingFlightId(null);
      reset();
    } catch (err: any) {
      console.error('Failed to approve flight:', err);
      const message =
        (err?.message as string) ||
        (err?.data?.message as string) ||
        'Failed to add flight';
      setError(message);
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectSingle = async (id: string) => {
    setProcessing(true);
    try {
      await rejectMutation.mutateAsync({ id });
      onFlightsUpdated();
    } catch (error) {
      console.error('Failed to reject flight:', error);
    } finally {
      setProcessing(false);
    }
  };

  const openEditForm = (flight: PendingFlight) => {
    setEditingFlightId(flight.id);
    reset({
      airlineId: flight.parsedData.airline,
      flightNumber: flight.parsedData.flightNumber,
      departureAirportId: flight.parsedData.departureAirport,
      arrivalAirportId: flight.parsedData.arrivalAirport,
    });
  };

  if (!isOpen) return null;

  const editingFlight = pendingFlights.find(f => f.id === editingFlightId);

  return (
    <div className="modal modal-open">
      <div className="modal-box w-11/12 max-w-5xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-bold">Review Pending Flights</h3>
            <p className="text-base-content/60 text-sm">
              {pendingFlights.length} flight(s) found
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">
              {selectedFlightIds.size} selected
            </span>
            <div className="btn-group">
              <button
                className="btn btn-sm btn-ghost"
                onClick={handleSelectAll}
              >
                {selectedFlightIds.size === processedFlights.length
                  ? 'Deselect All'
                  : 'Select All'}
              </button>
              {selectedFlightIds.size > 0 && (
                <button
                  className="btn btn-sm btn-ghost"
                  onClick={() => setSelectedFlightIds(new Set())}
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-error mb-4">
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
            <span>{error}</span>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setError(null)}
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Filters & Sorting */}
        <div className="bg-base-200 mb-4 grid grid-cols-2 gap-4 rounded-lg p-4 md:grid-cols-4">
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text text-xs">Sort By</span>
            </label>
            <select
              className="select select-bordered select-sm w-full"
              value={sortField}
              onChange={e => setSortField(e.target.value as SortField)}
            >
              <option value="date">Date</option>
              <option value="airline">Airline</option>
              <option value="calendar">Calendar</option>
              <option value="route">Route</option>
            </select>
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text text-xs">Order</span>
            </label>
            <select
              className="select select-bordered select-sm w-full"
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value as SortOrder)}
            >
              <option value="desc">Desc</option>
              <option value="asc">Asc</option>
            </select>
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text text-xs">Filter Airline</span>
            </label>
            <select
              className="select select-bordered select-sm w-full"
              value={filterAirline}
              onChange={e => setFilterAirline(e.target.value)}
            >
              <option value="">All Airlines</option>
              {uniqueAirlines.map(airline => (
                <option key={airline} value={airline}>
                  {airline}
                </option>
              ))}
            </select>
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text text-xs">Filter Calendar</span>
            </label>
            <select
              className="select select-bordered select-sm w-full"
              value={filterCalendar}
              onChange={e => setFilterCalendar(e.target.value)}
            >
              <option value="">All Calendars</option>
              {uniqueCalendars.map(cal => (
                <option key={cal} value={cal}>
                  {cal}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden max-h-[60vh] overflow-y-auto md:block">
          <table className="table-sm table w-full">
            <thead>
              <tr>
                <th className="w-12">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-sm"
                    checked={
                      processedFlights.length > 0 &&
                      selectedFlightIds.size === processedFlights.length
                    }
                    onChange={handleSelectAll}
                  />
                </th>
                <th>Flight</th>
                <th>Route</th>
                <th>Date/Time</th>
                <th>Calendar</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {processedFlights.map(flight => {
                const isSelected = selectedFlightIds.has(flight.id);
                return (
                  <tr
                    key={flight.id}
                    className={isSelected ? 'bg-primary/10' : ''}
                  >
                    <td>
                      <input
                        type="checkbox"
                        className="checkbox checkbox-sm"
                        checked={isSelected}
                        onChange={() => handleToggleFlight(flight.id)}
                      />
                    </td>
                    <td>
                      <div className="font-bold">
                        {flight.parsedData.airline ?? '?'}
                        {flight.parsedData.flightNumber ?? '?'}
                      </div>
                      <div className="text-xs opacity-50">
                        {flight.parsedData.rawSummary}
                      </div>
                    </td>
                    <td>
                      {flight.parsedData.departureAirport ?? '???'} →{' '}
                      {flight.parsedData.arrivalAirport ?? '???'}
                    </td>
                    <td>
                      <div className="text-sm">
                        {flight.parsedData.outTime
                          ? flight.parsedData.outTime.toLocaleDateString()
                          : 'Unknown Date'}
                      </div>
                      <div className="text-xs opacity-50">
                        {flight.parsedData.outTime
                          ? flight.parsedData.outTime.toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : ''}
                      </div>
                    </td>
                    <td>
                      <div className="badge badge-ghost badge-sm">
                        {flight.calendarSource.name}
                      </div>
                    </td>
                    <td className="text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          className="btn btn-ghost btn-xs"
                          onClick={() => openEditForm(flight)}
                          disabled={processing}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-error btn-outline btn-xs"
                          onClick={() => handleRejectSingle(flight.id)}
                          disabled={processing}
                        >
                          Reject
                        </button>
                        <button
                          className="btn btn-primary btn-xs"
                          onClick={() => handleApproveSingle(flight.id)}
                          disabled={processing}
                        >
                          Approve
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="grid max-h-[60vh] gap-4 overflow-y-auto md:hidden">
          {processedFlights.map(flight => {
            const isSelected = selectedFlightIds.has(flight.id);
            return (
              <div
                key={flight.id}
                className={`card bg-base-100 border-base-200 border shadow-sm ${
                  isSelected ? 'border-primary ring-primary ring-1' : ''
                }`}
              >
                <div className="card-body p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-sm"
                        checked={isSelected}
                        onChange={() => handleToggleFlight(flight.id)}
                      />
                      <div>
                        <h4 className="font-bold">
                          {flight.parsedData.airline ?? '?'}
                          {flight.parsedData.flightNumber ?? '?'}
                        </h4>
                        <p className="text-xs opacity-50">
                          {flight.calendarSource.name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <div>
                        {flight.parsedData.departureAirport ?? '???'} →{' '}
                        {flight.parsedData.arrivalAirport ?? '???'}
                      </div>
                      <div className="text-xs opacity-70">
                        {flight.parsedData.outTime
                          ? flight.parsedData.outTime.toLocaleDateString()
                          : 'Unknown'}
                      </div>
                    </div>
                  </div>

                  <div className="card-actions mt-2 justify-end">
                    <button
                      className="btn btn-ghost btn-xs"
                      onClick={() => openEditForm(flight)}
                      disabled={processing}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-error btn-outline btn-xs"
                      onClick={() => handleRejectSingle(flight.id)}
                      disabled={processing}
                    >
                      Reject
                    </button>
                    <button
                      className="btn btn-success btn-xs"
                      onClick={() => handleApproveSingle(flight.id)}
                      disabled={processing}
                    >
                      Approve
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {processedFlights.length === 0 && (
          <div className="py-8 text-center opacity-50">
            No pending flights match your filters
          </div>
        )}

        <div className="modal-action bg-base-100 sticky bottom-0 z-10 -mx-6 -mb-6 border-t p-4">
          <div className="flex w-full justify-between gap-2">
            <button className="btn" onClick={onClose} disabled={processing}>
              Cancel
            </button>
            <div className="flex gap-2">
              <button
                className="btn btn-error btn-outline"
                onClick={handleBulkReject}
                disabled={processing || processedFlights.length === 0}
              >
                Reject{' '}
                {selectedFlightIds.size > 0
                  ? `Selected (${selectedFlightIds.size})`
                  : 'All'}
              </button>
              <button
                className="btn btn-primary"
                onClick={handleBulkApprove}
                disabled={processing || processedFlights.length === 0}
              >
                Approve{' '}
                {selectedFlightIds.size > 0
                  ? `Selected (${selectedFlightIds.size})`
                  : 'All'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Form Modal Overlay */}
      {editingFlightId && editingFlight && (
        <div className="modal modal-open">
          <div className="modal-box relative">
            <button
              className="btn btn-sm btn-circle absolute top-2 right-2"
              onClick={() => setEditingFlightId(null)}
            >
              ✕
            </button>
            <h3 className="text-lg font-bold">Edit Flight Details</h3>
            <p className="py-4 text-sm">
              Original: {editingFlight.parsedData.rawSummary}
            </p>

            <form
              onSubmit={handleSubmit(data =>
                handleApproveSingle(editingFlightId, data),
              )}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Airline ID</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered input-sm"
                    {...register('airlineId')}
                    placeholder="e.g., AA"
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Flight Number</span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered input-sm"
                    {...register('flightNumber', { valueAsNumber: true })}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Departure</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered input-sm"
                    {...register('departureAirportId')}
                    placeholder="e.g., JFK"
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Arrival</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered input-sm"
                    {...register('arrivalAirportId')}
                    placeholder="e.g., LAX"
                  />
                </div>
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  className="btn"
                  onClick={() => setEditingFlightId(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={processing}
                >
                  {processing ? 'Saving...' : 'Save & Approve'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
