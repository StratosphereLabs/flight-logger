/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/no-confusing-void-expression */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
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
  parsedData: any;
  detectedAt: string;
}

interface PendingFlightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  pendingFlights: PendingFlight[];
  onFlightsUpdated: () => void;
}

export const PendingFlightsModal = ({
  isOpen,
  onClose,
  pendingFlights,
  onFlightsUpdated,
}: PendingFlightsModalProps): JSX.Element | null => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showEditForm, setShowEditForm] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentFlight = pendingFlights[currentIndex];

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

  const handleApprove = async (data: EditFlightForm) => {
    if (!currentFlight) return;

    setProcessing(true);
    setError(null);
    try {
      await approveMutation.mutateAsync({
        id: currentFlight.id,
        ...data,
      });
      moveToNext();
    } catch (err: any) {
      console.error('Failed to approve flight:', err);
      // tRPC errors have a message property, or look in data
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const message =
        err?.message || err?.data?.message || 'Failed to add flight';
      setError(message);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!currentFlight) return;

    setProcessing(true);
    try {
      await rejectMutation.mutateAsync({ id: currentFlight.id });
      moveToNext();
    } catch (error) {
      console.error('Failed to reject flight:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleBulkApprove = async () => {
    setProcessing(true);
    setError(null);
    try {
      const results = await bulkApproveMutation.mutateAsync({
        ids: pendingFlights.map(f => f.id),
      });
      // Check for any failures
      const failures = results.filter((r: any) => !r.success);
      if (failures.length > 0) {
        setError(
          `${failures.length} flight(s) failed to add. Check console for details.`,
        );
        console.error('Bulk approve failures:', failures);
      }
      onFlightsUpdated();
      if (failures.length === 0) {
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
    if (!confirm(`Reject all ${pendingFlights.length} pending flights?`))
      return;

    setProcessing(true);
    try {
      await bulkRejectMutation.mutateAsync({
        ids: pendingFlights.map(f => f.id),
      });
      onFlightsUpdated();
      onClose();
    } catch (error) {
      console.error('Failed to bulk reject flights:', error);
    } finally {
      setProcessing(false);
    }
  };

  const moveToNext = () => {
    reset();
    setShowEditForm(false);
    setError(null);

    if (currentIndex < pendingFlights.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // All flights processed
      onFlightsUpdated();
      onClose();
    }
  };

  if (!isOpen || !currentFlight) return null;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const parsedData = currentFlight.parsedData || {};

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">Review Pending Flights</h3>
          <div className="text-base-content/60 text-sm">
            {currentIndex + 1} of {pendingFlights.length}
          </div>
        </div>

        <div className="space-y-4">
          {error && (
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
              <span>{error}</span>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setError(null)}
              >
                Dismiss
              </button>
            </div>
          )}

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
              <div className="font-bold">
                New flight detected from {currentFlight.calendarSource.name}
              </div>
              <div className="text-xs">
                Detected on{' '}
                {new Date(currentFlight.detectedAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-semibold">Flight Details</h4>
              <div className="space-y-1 text-sm">
                <div>
                  <strong>Airline:</strong> {parsedData.airline || 'Unknown'}
                </div>
                <div>
                  <strong>Flight:</strong>{' '}
                  {parsedData.flightNumber || 'Unknown'}
                </div>
                <div>
                  <strong>Route:</strong> {parsedData.departureAirport || '?'} →{' '}
                  {parsedData.arrivalAirport || '?'}
                </div>
                <div>
                  <strong>Departure:</strong>{' '}
                  {parsedData.outTime
                    ? new Date(parsedData.outTime).toLocaleString()
                    : 'Unknown'}
                </div>
                <div>
                  <strong>Arrival:</strong>{' '}
                  {parsedData.inTime
                    ? new Date(parsedData.inTime).toLocaleString()
                    : 'Unknown'}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">Raw Data</h4>
              <div className="bg-base-200 max-h-32 overflow-y-auto rounded p-2 text-xs">
                <div>
                  <strong>Summary:</strong> {parsedData.rawSummary}
                </div>
              </div>
            </div>
          </div>

          {showEditForm && (
            <form
              onSubmit={handleSubmit(handleApprove)}
              className="space-y-4 border-t pt-4"
            >
              <h4 className="font-semibold">Edit Flight Details (Optional)</h4>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                    <span className="label-text">Departure Airport</span>
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
                    <span className="label-text">Arrival Airport</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered input-sm"
                    {...register('arrivalAirportId')}
                    placeholder="e.g., LAX"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={processing}
                >
                  {processing ? 'Adding...' : 'Add with Changes'}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setShowEditForm(false)}
                >
                  Cancel Edit
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="modal-action">
          <div className="flex w-full justify-between gap-2">
            <div className="flex gap-2">
              <button
                className="btn btn-outline"
                onClick={handleBulkReject}
                disabled={processing}
              >
                Reject All
              </button>
              <button
                className="btn btn-primary"
                onClick={handleBulkApprove}
                disabled={processing}
              >
                Approve All
              </button>
            </div>

            <div className="flex gap-2">
              {!showEditForm && (
                <button
                  className="btn btn-ghost"
                  onClick={() => setShowEditForm(true)}
                  disabled={processing}
                >
                  Edit & Add
                </button>
              )}
              <button
                className="btn btn-outline"
                onClick={handleReject}
                disabled={processing}
              >
                Skip
              </button>
              <button
                className="btn btn-primary"
                onClick={() => handleApprove({})}
                disabled={processing}
              >
                Add Flight
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
