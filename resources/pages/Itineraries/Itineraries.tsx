import { getCoreRowModel } from '@tanstack/react-table';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button, Table } from 'stratosphere-ui';
import { ActionsCell, PlusIcon } from '../../common/components';
import { APP_URL } from '../../common/constants';
import {
  useCopyToClipboard,
  useProfilePage,
  useTRPCErrorHandler,
} from '../../common/hooks';
import { trpc } from '../../utils/trpc';
import { DeleteItineraryModal } from './DeleteItineraryModal';
import { useItinerariesPageStore } from './itinerariesPageStore';

export const Itineraries = (): JSX.Element => {
  const enabled = useProfilePage();
  const navigate = useNavigate();
  const { username } = useParams();
  const { setActiveItinerary, setIsDeleteDialogOpen, setIsEditDialogOpen } =
    useItinerariesPageStore();
  const copyToClipboard = useCopyToClipboard();
  const onError = useTRPCErrorHandler();
  const { data, isFetching } = trpc.users.getUserItineraries.useQuery(
    {
      username,
    },
    {
      enabled,
      staleTime: 5 * 60 * 1000,
      onError,
    },
  );
  return (
    <div className="flex flex-col items-center gap-4 p-2 sm:p-3">
      <article className="prose">
        <h2>
          {username !== undefined
            ? `${username}'s Itineraries`
            : 'My Itineraries'}
        </h2>
      </article>
      {!isFetching && data?.length === 0 ? (
        <div className="mt-12 flex justify-center">
          <div className="flex flex-col items-center gap-8">
            <p className="opacity-75">No Itineraries</p>
            {username === undefined ? (
              <Button
                color="primary"
                onClick={() => {
                  navigate('/create-itinerary');
                }}
              >
                <PlusIcon className="h-6 w-6" />
                Create Itinerary
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}
      {isFetching ? (
        <div className="flex flex-1 justify-center pt-8">
          <span className="loading loading-spinner" />
        </div>
      ) : null}
      {!isFetching && data !== undefined && data.length > 0 ? (
        <Table
          className="table-sm table-fixed border-separate shadow-md xl:table-md"
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
              accessorKey: 'outDateLocal',
              header: () => 'Date',
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
              id: 'duration',
              accessorKey: 'itineraryDuration',
              header: () => 'Duration',
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
                  onCopyLink={() => {
                    copyToClipboard(
                      `${APP_URL}/itinerary/${row.original.id}`,
                      'Link copied to clipboard!',
                    );
                  }}
                  onDelete={() => {
                    setActiveItinerary(row.original);
                    setIsDeleteDialogOpen(true);
                  }}
                  onEdit={() => {
                    setActiveItinerary(row.original);
                    setIsEditDialogOpen(true);
                  }}
                  onView={() => {
                    navigate(`/itinerary/${row.original.id}`);
                  }}
                />
              ),
              footer: () => null,
            },
          ]}
          cellClassNames={{
            date: 'w-[200px]',
            numFlights: 'w-[150px] hidden md:table-cell',
            duration: 'w-[150px] hidden md:table-cell',
            distance: 'w-[150px] hidden lg:table-cell',
            actions: 'w-[50px] xl:w-[150px]',
          }}
          data={data ?? []}
          enableSorting={false}
          getCoreRowModel={getCoreRowModel()}
        />
      ) : null}
      <DeleteItineraryModal />
    </div>
  );
};
