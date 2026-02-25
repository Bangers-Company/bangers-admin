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

export default function UsersPage() {
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

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
    } finally {
      setLoading(false)
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
    </div>
  )
}
