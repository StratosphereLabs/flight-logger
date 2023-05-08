import { getCoreRowModel } from '@tanstack/react-table';
import { Progress } from 'react-daisyui';
import { Link, useParams } from 'react-router-dom';
import { Table } from 'stratosphere-ui';
import { DeleteItineraryModal } from './DeleteItineraryModal';
import { useItinerariesPageStore } from './itinerariesPageStore';
import { ActionsCell } from '../../common/components';
import { APP_URL } from '../../common/constants';
import { useCopyToClipboard, useTRPCErrorHandler } from '../../common/hooks';
import { trpc } from '../../utils/trpc';

export interface DeleteFlightData {
  departureAirportId: string;
  arrivalAirportId: string;
  id: string;
}

export const Itineraries = (): JSX.Element => {
  const { username } = useParams();
  const {
    setActiveItinerary,
    setIsDeleteDialogOpen,
    setIsEditDialogOpen,
    setIsViewDialogOpen,
  } = useItinerariesPageStore();
  const copyToClipboard = useCopyToClipboard();
  const { data, error, isFetching } = trpc.users.getUserItineraries.useQuery({
    username,
  });
  useTRPCErrorHandler(error);
  return (
    <div className="flex flex-col items-center gap-4">
      <article className="prose">
        <h2>
          {username !== undefined
            ? `${username}'s Itineraries`
            : 'My Itineraries'}
        </h2>
      </article>
      {isFetching ? (
        <Progress />
      ) : (
        <Table
          className="table-compact xl:table-normal"
          columns={[
            {
              id: 'name',
              accessorKey: 'name',
              header: () => 'Name',
              cell: ({ getValue, row }) => {
                const name = getValue<string>();
                return (
                  <Link
                    to={`/itinerary/${row.original.id}`}
                    className="link-hover link font-semibold"
                  >
                    {name}
                  </Link>
                );
              },
              footer: () => null,
            },
            {
              id: 'date',
              accessorKey: 'date',
              header: () => 'Trip Date',
              cell: ({ getValue }) => {
                const date = getValue<string>();
                return <span className="opacity-75">{date}</span>;
              },
              footer: () => null,
            },
            {
              id: 'numFlights',
              accessorKey: 'numFlights',
              header: () => 'Legs',
              footer: () => null,
            },
            {
              id: 'distance',
              accessorKey: 'distance',
              header: () => 'Distance',
              cell: ({ getValue }) => {
                const distance = getValue<number>();
                return <span className="opacity-75">{distance} nm</span>;
              },
            },
            {
              id: 'actions',
              header: () => <div className="hidden xl:flex">Actions</div>,
              cell: ({ row }) => (
                <ActionsCell
                  deleteMessage="Delete Itinerary"
                  editMessage="Edit Itinerary"
                  viewMessage="View Itinerary"
                  onCopyLink={() =>
                    copyToClipboard(
                      `${APP_URL}/itinerary/${row.original.id}`,
                      'Link copied to clipboard!',
                    )
                  }
                  onDelete={() => {
                    setActiveItinerary(row.original);
                    setIsDeleteDialogOpen(true);
                  }}
                  onEdit={() => {
                    setActiveItinerary(row.original);
                    setIsEditDialogOpen(true);
                  }}
                  onView={() => {
                    setActiveItinerary(row.original);
                    setIsViewDialogOpen(true);
                  }}
                />
              ),
              footer: () => null,
            },
          ]}
          cellClassNames={{
            date: 'w-[200px] hidden sm:table-cell',
            numFlights: 'w-[150px] hidden md:table-cell',
            distance: 'w-[150px] hidden lg:table-cell',
            actions: 'w-[50px] xl:w-[150px]',
          }}
          data={data ?? []}
          enableFixedWidth
          enableSorting={false}
          getCoreRowModel={getCoreRowModel()}
        />
      )}
      <DeleteItineraryModal />
    </div>
  );
};
