import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Plus, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DataTable, SortableHeader } from '@/components/shared/DataTable'
import { DeleteDialog } from '@/components/shared/DeleteDialog'
import { PageHeader } from '@/components/shared/PageHeader'
import { ActForm } from './ActForm'
import { ActArtistsDialog } from './ActArtistsDialog'
import { ActStagesDialog } from './ActStagesDialog'
import { ActEventsDialog } from './ActEventsDialog'
import { useActs, useDeleteAct } from '@/hooks/useActs'

export default function ActsPage() {
  const [page, setPage] = useState(0)
  const [formOpen, setFormOpen] = useState(false)
  const [editingAct, setEditingAct] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingAct, setDeletingAct] = useState(null)
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false)
  const [bulkDeleteIds, setBulkDeleteIds] = useState([])
  const [bulkDeleting, setBulkDeleting] = useState(false)
  const [artistsDialogOpen, setArtistsDialogOpen] = useState(false)
  const [artistsAct, setArtistsAct] = useState(null)
  const [stagesDialogOpen, setStagesDialogOpen] = useState(false)
  const [stagesAct, setStagesAct] = useState(null)
  const [eventsDialogOpen, setEventsDialogOpen] = useState(false)
  const [eventsAct, setEventsAct] = useState(null)

  const { data, isLoading } = useActs(page + 1)
  const deleteAct = useDeleteAct()

  useEffect(() => { document.title = 'Acts — Bangers Admin' }, [])

  const acts = data?.data || []
  const meta = data?.meta || {}

  const columns = [
    {
      accessorKey: 'name',
      header: ({ column }) => <SortableHeader column={column}>Name</SortableHeader>,
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => {
        const desc = row.original.description
        if (!desc) return '—'
        return desc.length > 50 ? desc.slice(0, 50) + '...' : desc
      },
    },
    {
      id: 'artists',
      header: 'Artists',
      cell: ({ row }) => (
        <Badge variant="secondary">
          {row.original.artists?.length || 0}
        </Badge>
      ),
    },
    {
      id: 'stages',
      header: 'Stages',
      cell: ({ row }) => (
        <Badge variant="secondary">
          {row.original.stages?.length || 0}
        </Badge>
      ),
    },
    {
      id: 'events',
      header: 'Events',
      cell: ({ row }) => (
        <Badge variant="secondary">
          {row.original.events?.length || 0}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const act = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  setEditingAct(act)
                  setFormOpen(true)
                }}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setArtistsAct(act)
                  setArtistsDialogOpen(true)
                }}
              >
                Manage Artists
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setStagesAct(act)
                  setStagesDialogOpen(true)
                }}
              >
                Manage Stages
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setEventsAct(act)
                  setEventsDialogOpen(true)
                }}
              >
                Manage Events
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => {
                  setDeletingAct(act)
                  setDeleteDialogOpen(true)
                }}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  async function handleDelete() {
    try {
      await deleteAct.mutateAsync(deletingAct.id)
      toast.success('Act deleted')
      setDeleteDialogOpen(false)
      setDeletingAct(null)
    } catch (error) {
      toast.error(error.message || 'Failed to delete act')
    }
  }

  async function handleBulkDelete() {
    setBulkDeleting(true)
    try {
      await Promise.all(bulkDeleteIds.map((id) => deleteAct.mutateAsync(id)))
      toast.success(`${bulkDeleteIds.length} act(s) deleted`)
      setBulkDeleteDialogOpen(false)
      setBulkDeleteIds([])
    } catch (error) {
      toast.error(error.message || 'Failed to delete some acts')
    } finally {
      setBulkDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Acts"
        description="Manage acts and performances"
        action={
          <Button
            onClick={() => {
              setEditingAct(null)
              setFormOpen(true)
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Act
          </Button>
        }
      />
      <DataTable
        columns={columns}
        data={acts}
        pageCount={meta.last_page || 0}
        pageIndex={page}
        onPageChange={setPage}
        filterColumn="name"
        filterPlaceholder="Filter acts..."
        isLoading={isLoading}
        enableRowSelection
        enableColumnVisibility
        onBulkDelete={(ids) => {
          setBulkDeleteIds(ids)
          setBulkDeleteDialogOpen(true)
        }}
        emptyState={
          <div className="flex flex-col items-center gap-2 py-4">
            <p className="text-muted-foreground">No acts yet.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setEditingAct(null); setFormOpen(true) }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create your first act
            </Button>
          </div>
        }
      />
      <ActForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) setEditingAct(null)
        }}
        act={editingAct}
      />
      <ActArtistsDialog
        open={artistsDialogOpen}
        onOpenChange={(open) => {
          setArtistsDialogOpen(open)
          if (!open) setArtistsAct(null)
        }}
        act={artistsAct}
      />
      <ActStagesDialog
        open={stagesDialogOpen}
        onOpenChange={(open) => {
          setStagesDialogOpen(open)
          if (!open) setStagesAct(null)
        }}
        act={stagesAct}
      />
      <ActEventsDialog
        open={eventsDialogOpen}
        onOpenChange={(open) => {
          setEventsDialogOpen(open)
          if (!open) setEventsAct(null)
        }}
        act={eventsAct}
      />
      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open)
          if (!open) setDeletingAct(null)
        }}
        onConfirm={handleDelete}
        title="Delete Act"
        description={`Are you sure you want to delete "${deletingAct?.name}"? This action cannot be undone.`}
        isDeleting={deleteAct.isPending}
      />
      <DeleteDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={(open) => {
          setBulkDeleteDialogOpen(open)
          if (!open) setBulkDeleteIds([])
        }}
        onConfirm={handleBulkDelete}
        title="Delete Acts"
        description={`Are you sure you want to delete ${bulkDeleteIds.length} act(s)? This action cannot be undone.`}
        isDeleting={bulkDeleting}
      />
    </div>
  )
}
