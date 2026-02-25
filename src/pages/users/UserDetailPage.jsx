import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'
import { User, Calendar, Users, ArrowLeft, Mail, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/shared/PageHeader'
import { userApi } from '@/api/user'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { Loader2, Edit, Save, Camera, User as UserIcon } from 'lucide-react'
import { uploadMedia } from '@/api/media'
import { useRef } from 'react'

export default function UserDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [events, setEvents] = useState([])
  const [friends, setFriends] = useState([])
  const [loading, setLoading] = useState(true)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [userResponse, eventsResponse, friendsResponse] = await Promise.all([
        userApi.get(id),
        userApi.getEvents(id).catch(() => ({ data: [] })),
        userApi.getFriends(id).catch(() => ({ data: [] }))
      ])
      
      const userData = userResponse?.data || userResponse
      if (!userData || !userData.id) {
        throw new Error('User data is invalid')
      }
      
      setUser(userData)
      setEvents(eventsResponse?.data || eventsResponse || [])
      setFriends(friendsResponse?.data || friendsResponse || [])
    } catch (error) {
      console.error('Failed to fetch user details:', error)
      toast.error(error.message || 'Failed to fetch user details')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [id])

  const handleUpdateUser = async (e) => {
    e.preventDefault()
    setUpdating(true)
    const formData = new FormData(e.target)
    const payload = {
      ...Object.fromEntries(formData.entries()),
      is_public: formData.get('is_public') === 'on'
    }
    
    try {
      await userApi.update(id, payload)
      toast.success('Profile updated successfully')
      setIsEditDialogOpen(false)
      fetchData()
    } catch (error) {
      console.error('Failed to update user', error)
      toast.error(error.message || 'Failed to update user')
    } finally {
      setUpdating(false)
    }
  }

  const handleProfilePictureClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const response = await uploadMedia(file, 'profile_picture')
      const mediaId = response.data?.id || response.id
      
      await userApi.update(id, { profile_media_id: mediaId })
      toast.success('Profile picture updated')
      fetchData()
    } catch (error) {
      console.error('Failed to upload profile picture', error)
      toast.error('Failed to upload profile picture')
    } finally {
      setUploading(false)
    }
  }

  if (loading) return <div className="p-8">Loading user details...</div>
  if (!user) return <div className="p-8 text-center">User not found</div>

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <Button variant="ghost" onClick={() => navigate('/users')} className="pl-0">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Users
      </Button>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader className="flex flex-col items-center">
            <div 
              className="group relative flex h-24 w-24 cursor-pointer items-center justify-center rounded-full bg-muted overflow-hidden border-2 border-transparent hover:border-primary transition-all"
              onClick={handleProfilePictureClick}
            >
              {user.profile_media_url ? (
                <img src={user.profile_media_url} alt={user.username} className="h-full w-full object-cover" />
              ) : (
                <UserIcon className="h-12 w-12" />
              )}
              {uploading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <Loader2 className="h-8 w-8 animate-spin text-white" />
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="h-8 w-8 text-white" />
                </div>
              )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange} 
            />
            <CardTitle className="mt-4 text-xl">{user.first_name} {user.last_name}</CardTitle>
            <CardDescription>@{user.username}</CardDescription>
            <div className="mt-4 flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setIsEditDialogOpen(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-1">
              {user.roles?.map(role => (
                <Badge key={role.id}>{role.name}</Badge>
              ))}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{user.email}</span>
            </div>
            {user.bio && (
              <div className="text-sm italic text-muted-foreground">
                "{user.bio}"
              </div>
            )}
            <div className="pt-4 border-t text-xs text-muted-foreground">
              Joined {new Date(user.created_at).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <Tabs defaultValue="events" className="w-full">
            <CardHeader className="p-0 border-b">
              <TabsList className="w-full justify-start rounded-none h-12 bg-transparent">
                <TabsTrigger value="events" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                  <Calendar className="mr-2 h-4 w-4" />
                  Events ({events.length})
                </TabsTrigger>
                <TabsTrigger value="friends" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                  <Users className="mr-2 h-4 w-4" />
                  Friends ({friends.length})
                </TabsTrigger>
              </TabsList>
            </CardHeader>
            <TabsContent value="events" className="p-0 m-0">
              <CardContent className="pt-6">
                {events.length > 0 ? (
                  <div className="space-y-4">
                    {events.map(event => (
                      <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-semibold">{event.name}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {event.location}
                          </div>
                        </div>
                        <Badge variant={event.pivot?.status === 'going' ? 'default' : 'secondary'}>
                          {event.pivot?.status || 'attending'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">No events history found.</div>
                )}
              </CardContent>
            </TabsContent>
            <TabsContent value="friends" className="p-0 m-0">
              <CardContent className="pt-6">
                {friends.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {friends.map(friend => (
                      <div key={friend.id} className="flex items-center gap-3 p-3 border rounded-lg">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                          <User className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{friend.first_name} {friend.last_name}</p>
                          <p className="text-xs text-muted-foreground">@{friend.username}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">No friends found.</div>
                )}
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update user details. Some fields are read-only due to backend restrictions.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateUser} className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input id="first_name" name="first_name" defaultValue={user.first_name} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input id="last_name" name="last_name" defaultValue={user.last_name} required />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" name="username" defaultValue={user.username} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" defaultValue={user.email} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dob">Date of Birth</Label>
              <Input id="dob" name="dob" type="date" defaultValue={user.dob ? user.dob.split('T')[0] : ''} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" name="bio" defaultValue={user.bio} placeholder="Enter user bio..." />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="is_public" name="is_public" defaultChecked={user.is_public} />
              <Label htmlFor="is_public">Public Profile</Label>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updating}>
                {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
