import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Plus, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DataTable, SortableHeader } from '@/components/shared/DataTable'
import { DeleteDialog } from '@/components/shared/DeleteDialog'
import { PageHeader } from '@/components/shared/PageHeader'
import { ArtistForm } from './ArtistForm'
import { useArtists, useDeleteArtist } from '@/hooks/useArtists'

export default function ArtistsPage() {
  const [page, setPage] = useState(0)
  const [formOpen, setFormOpen] = useState(false)
  const [editingArtist, setEditingArtist] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingArtist, setDeletingArtist] = useState(null)
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false)
  const [bulkDeleteIds, setBulkDeleteIds] = useState([])
  const [bulkDeleting, setBulkDeleting] = useState(false)

  const [search, setSearch] = useState('')
  const { data, isLoading } = useArtists(page + 1, { search })
  const deleteArtist = useDeleteArtist()

  useEffect(() => { document.title = 'Artists — Bangers Admin' }, [])

  const artists = data?.data || []
  const meta = data?.meta || {}

  const columns = [
    {
      accessorKey: 'name',
      header: ({ column }) => <SortableHeader column={column}>Name</SortableHeader>,
    },
    {
      accessorKey: 'genre',
      header: 'Genre',
      cell: ({ row }) =>
        row.original.genre ? (
          <Badge variant="secondary">{row.original.genre}</Badge>
        ) : (
          '—'
        ),
    },
    {
      accessorKey: 'bio',
      header: 'Bio',
      cell: ({ row }) => {
        const bio = row.original.bio
        if (!bio) return '—'
        return bio.length > 50 ? bio.slice(0, 50) + '...' : bio
      },
    },
    {
      id: 'acts',
      header: 'Acts',
      cell: ({ row }) => row.original.acts?.length || 0,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const artist = row.original
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
                  setEditingArtist(artist)
                  setFormOpen(true)
                }}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => {
                  setDeletingArtist(artist)
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
      await deleteArtist.mutateAsync(deletingArtist.id)
      toast.success('Artist deleted')
      setDeleteDialogOpen(false)
      setDeletingArtist(null)
    } catch (error) {
      toast.error(error.message || 'Failed to delete artist')
    }
  }

  async function handleBulkDelete() {
    setBulkDeleting(true)
    try {
      await Promise.all(bulkDeleteIds.map((id) => deleteArtist.mutateAsync(id)))
      toast.success(`${bulkDeleteIds.length} artist(s) deleted`)
      setBulkDeleteDialogOpen(false)
      setBulkDeleteIds([])
    } catch (error) {
      toast.error(error.message || 'Failed to delete some artists')
    } finally {
      setBulkDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Artists"
        description="Manage artists and performers"
        action={
          <Button
            onClick={() => {
              setEditingArtist(null)
              setFormOpen(true)
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Artist
          </Button>
        }
      />
      <DataTable
        columns={columns}
        data={artists}
        pageCount={meta.last_page || 0}
        pageIndex={page}
        onPageChange={setPage}
        filterValue={search}
        onFilterChange={setSearch}
        filterColumn="name"
        filterPlaceholder="Search artists..."
        isLoading={isLoading}
        enableRowSelection
        enableColumnVisibility
        onBulkDelete={(ids) => {
          setBulkDeleteIds(ids)
          setBulkDeleteDialogOpen(true)
        }}
        emptyState={
          <div className="flex flex-col items-center gap-2 py-4">
            <p className="text-muted-foreground">No artists yet.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setEditingArtist(null); setFormOpen(true) }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create your first artist
            </Button>
          </div>
        }
      />
      <ArtistForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) setEditingArtist(null)
        }}
        artist={editingArtist}
      />
      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open)
          if (!open) setDeletingArtist(null)
        }}
        onConfirm={handleDelete}
        title="Delete Artist"
        description={`Are you sure you want to delete "${deletingArtist?.name}"? This action cannot be undone.`}
        isDeleting={deleteArtist.isPending}
      />
      <DeleteDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={(open) => {
          setBulkDeleteDialogOpen(open)
          if (!open) setBulkDeleteIds([])
        }}
        onConfirm={handleBulkDelete}
        title="Delete Artists"
        description={`Are you sure you want to delete ${bulkDeleteIds.length} artist(s)? This action cannot be undone.`}
        isDeleting={bulkDeleting}
      />
    </div>
  )
}
