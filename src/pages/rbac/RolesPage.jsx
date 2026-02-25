import { useState, useEffect } from 'react'
import { Shield, MoreHorizontal, Plus, ShieldCheck, Trash2, Edit } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { DataTable, SortableHeader } from '@/components/shared/DataTable'
import { PageHeader } from '@/components/shared/PageHeader'
import { RoleDialog } from '@/components/rbac/RoleDialog'
import { rbacApi } from '@/api/rbac'
import { toast } from 'sonner'

export default function RolesPage() {
  const queryClient = useQueryClient()
  const [roleDialogOpen, setRoleDialogOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [roleToDelete, setRoleToDelete] = useState(null)

  useEffect(() => {
    document.title = 'Roles & Permissions — Bangers Admin'
  }, [])

  const { data: roles = [], isLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const response = await rbacApi.listRoles()
      return response.data || response
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => rbacApi.deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      toast.success('Role deleted successfully')
      setDeleteDialogOpen(false)
    },
  })

  const handleEdit = (role) => {
    setSelectedRole(role)
    setRoleDialogOpen(true)
  }

  const handleDelete = (role) => {
    setRoleToDelete(role)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (roleToDelete) {
      deleteMutation.mutate(roleToDelete.id)
    }
  }

  const handleCreate = () => {
    setSelectedRole(null)
    setRoleDialogOpen(true)
  }

  const columns = [
    {
      accessorKey: 'name',
      header: ({ column }) => <SortableHeader column={column}>Role Name</SortableHeader>,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          <span className="font-semibold uppercase tracking-wider">{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: 'permissions',
      header: 'Permissions',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1 max-w-md">
          {row.original.permissions?.map((p) => (
            <Badge key={p.id} variant="outline" className="bg-primary/5">
              {p.name}
            </Badge>
          ))}
          {(!row.original.permissions || row.original.permissions.length === 0) && (
            <span className="text-xs text-muted-foreground">No permissions assigned</span>
          )}
        </div>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleEdit(row.original)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Role
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-destructive focus:text-destructive" 
              onClick={() => handleDelete(row.original)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Role
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title="Roles & Permissions"
        description="Manage system access levels and permissions"
        action={
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Create Role
          </Button>
        }
      />
      <DataTable
        columns={columns}
        data={roles}
        isLoading={isLoading}
        emptyState={
          <div className="text-center py-8 text-muted-foreground">
            No roles defined yet.
          </div>
        }
      />
      
      <div className="rounded-lg border bg-muted/20 p-4 flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-primary mt-0.5" />
        <div>
          <p className="text-sm font-medium">RBAC Information</p>
          <p className="text-xs text-muted-foreground mt-1">
            Permissions are managed at the role level. Users assigned to these roles inherit all associated permissions.
          </p>
        </div>
      </div>

      <RoleDialog 
        open={roleDialogOpen} 
        onOpenChange={setRoleDialogOpen} 
        role={selectedRole}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the <span className="font-semibold text-foreground">{roleToDelete?.name}</span> role. 
              This action cannot be undone and may affect users currently assigned to this role.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete Role'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
