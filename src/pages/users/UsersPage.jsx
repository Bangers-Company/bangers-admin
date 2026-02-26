import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { User, MoreHorizontal, Mail, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DataTable, SortableHeader } from '@/components/shared/DataTable'
import { PageHeader } from '@/components/shared/PageHeader'
import { userApi } from '@/api/user'
import { rbacApi } from '@/api/rbac'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Loader2, Plus } from 'lucide-react'

export default function UsersPage() {
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [roles, setRoles] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [roleUpdating, setRoleUpdating] = useState(false)
  const [creating, setCreating] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchRoles()
  }, [])

  useEffect(() => {
    document.title = 'Users — Bangers Admin'
    fetchUsers()
  }, [page, search])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await userApi.list({ page: page + 1, search })
      setData(response)
    } catch (error) {
      console.error('Failed to fetch users', error)
      toast.error('Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  const fetchRoles = async () => {
    try {
      const response = await rbacApi.listRoles()
      setRoles(response.data || [])
    } catch (error) {
      console.error('Failed to fetch roles', error)
    }
  }

  const handleRoleChange = async (userId, newRoleId) => {
    setRoleUpdating(true)
    try {
      const user = users.find(u => u.id === userId) || selectedUser
      const currentRoles = user?.roles || []
      
      // 1. Remove all existing roles
      for (const role of currentRoles) {
        if (role.id !== newRoleId) {
          await userApi.removeRole(userId, role.id)
        }
      }

      // 2. Assign new role (if not "none")
      if (newRoleId !== 'none') {
        const alreadyHasNewRole = currentRoles.some(r => r.id === newRoleId)
        if (!alreadyHasNewRole) {
          await userApi.assignRole(userId, newRoleId)
        }
        toast.success('Role updated')
      } else {
        toast.success('All roles removed')
      }

      // Refresh user list
      fetchUsers()
      
      // Update selectedUser if in dialog
      if (selectedUser && selectedUser.id === userId) {
        const updatedUser = { ...selectedUser }
        if (newRoleId === 'none') {
            updatedUser.roles = []
        } else {
            const newRole = roles.find(r => r.id === newRoleId)
            updatedUser.roles = newRole ? [newRole] : []
        }
        setSelectedUser(updatedUser)
      }
    } catch (error) {
      console.error('Failed to update role', error)
      toast.error('Failed to update role')
    } finally {
      setRoleUpdating(false)
    }
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    setCreating(true)
    const formData = new FormData(e.target)
    const payload = Object.fromEntries(formData.entries())
    
    try {
      await userApi.create(payload)
      toast.success('User created successfully')
      setIsCreateDialogOpen(false)
      fetchUsers()
    } catch (error) {
      console.error('Failed to create user', error)
      toast.error(error.message || 'Failed to create user')
    } finally {
      setCreating(false)
    }
  }

  const users = data?.data || []
  const meta = data?.meta || {}

  const columns = [
    {
      accessorKey: 'username',
      header: ({ column }) => <SortableHeader column={column}>Username</SortableHeader>,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
            <User className="h-4 w-4" />
          </div>
          <span className="font-medium">{row.original.username}</span>
        </div>
      ),
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Mail className="h-4 w-4" />
          {row.original.email}
        </div>
      ),
    },
    {
      id: 'name',
      header: 'Full Name',
      cell: ({ row }) => `${row.original.first_name} ${row.original.last_name}`,
    },
    {
      accessorKey: 'roles',
      header: 'Roles',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.roles?.map((role) => (
            <Badge key={role.id} variant="secondary">
              {role.name}
            </Badge>
          ))}
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
            <DropdownMenuItem onClick={() => navigate(`/users/${row.original.id}`)}>
              View Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {
              setSelectedUser(row.original)
              setIsRoleDialogOpen(true)
            }}>
              Manage Roles
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              Delete User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title="Users"
        description="Manage system users and their profiles"
        action={
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create User
          </Button>
        }
      />
      <DataTable
        columns={columns}
        data={users}
        pageCount={meta.last_page || 0}
        pageIndex={page}
        onPageChange={setPage}
        filterValue={search}
        onFilterChange={setSearch}
        filterColumn="username"
        filterPlaceholder="Search users..."
        isLoading={loading}
      />

      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Manage Roles</DialogTitle>
            <DialogDescription>
              Update roles for <strong>{selectedUser?.username}</strong>. Changes are saved immediately.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="role-select">Select Role</Label>
              <Select
                value={selectedUser?.roles?.[0]?.id || 'none'}
                onValueChange={(value) => handleRoleChange(selectedUser.id, value)}
                disabled={roleUpdating}
              >
                <SelectTrigger id="role-select">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (No Role)</SelectItem>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedUser?.roles?.[0]?.description && (
                 <p className="text-xs text-muted-foreground mt-1">
                   {selectedUser.roles[0].description}
                 </p>
              )}
            </div>
            {roleUpdating && (
              <div className="flex items-center justify-center py-2">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm text-muted-foreground">Updating...</span>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Enter the details for the new user. All fields are required.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateUser} className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input id="first_name" name="first_name" placeholder="John" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input id="last_name" name="last_name" placeholder="Doe" required />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" name="username" placeholder="johndoe" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="john@example.com" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" placeholder="••••••••" required minLength={8} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dob">Date of Birth</Label>
              <Input id="dob" name="dob" type="date" required />
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={creating}>
                {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create User
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
