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

  const { data, isLoading } = useArtists(page + 1)
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
        filterColumn="name"
        filterPlaceholder="Filter artists..."
        isLoading={isLoading}
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
    </div>
  )
}
