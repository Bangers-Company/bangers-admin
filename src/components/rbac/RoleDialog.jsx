import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { rbacApi } from '@/api/rbac'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Label } from '@/components/ui/label'

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  permissions: z.array(z.string()).default([]),
})

export function RoleDialog({ open, onOpenChange, role, onSuccess }) {
  const queryClient = useQueryClient()
  
  const { data: permissions = [] } = useQuery({
    queryKey: ['permissions'],
    queryFn: async () => {
      const response = await rbacApi.listPermissions()
      return response.data || response
    },
    enabled: open,
  })

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      permissions: [],
    },
  })

  useEffect(() => {
    if (open) {
      if (role) {
        form.reset({
          name: role.name,
          description: role.description || '',
          permissions: role.permissions?.map(p => String(p.id)) || [],
        })
      } else {
        form.reset({
          name: '',
          description: '',
          permissions: [],
        })
      }
    }
  }, [role, form, open])

  const mutation = useMutation({
    mutationFn: (data) => rbacApi.saveRole({ ...data, id: role?.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      toast.success(role ? 'Role updated' : 'Role created')
      onSuccess?.()
      onOpenChange(false)
    },
  })

  function onSubmit(values) {
    mutation.mutate(values)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{role ? 'Edit Role' : 'Create Role'}</DialogTitle>
          <DialogDescription>
            {role ? 'Update role name and assigned permissions.' : 'Create a new role and assign permissions to it.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Moderator" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Brief description of this role" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="permissions"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <div className="space-y-1">
                    <FormLabel className="text-base font-semibold">Permissions</FormLabel>
                    <FormDescription>
                      Select which permissions are assigned to this role.
                    </FormDescription>
                  </div>
                  <div className="max-h-[250px] overflow-y-auto rounded-md border p-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {permissions.map((permission) => (
                        <div
                          key={permission.id}
                          className="flex flex-row items-center space-x-3 space-y-0"
                        >
                          <Checkbox
                            id={`perm-${permission.id}`}
                            checked={field.value?.includes(permission.id)}
                            onCheckedChange={(checked) => {
                              const current = field.value || []
                              if (checked) {
                                field.onChange([...current, permission.id])
                              } else {
                                field.onChange(current.filter(id => id !== permission.id))
                              }
                            }}
                          />
                          <Label
                            htmlFor={`perm-${permission.id}`}
                            className="text-sm font-normal cursor-pointer text-foreground"
                          >
                            {permission.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {role ? 'Save Changes' : 'Create Role'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
