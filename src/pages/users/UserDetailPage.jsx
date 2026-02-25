import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'
import { User, Calendar, Users, ArrowLeft, Mail, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/shared/PageHeader'
import { userApi } from '@/api/user'

export default function UserDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [events, setEvents] = useState([])
  const [friends, setFriends] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [userData, eventData, friendData] = await Promise.all([
          userApi.get(id),
          userApi.getEvents(id),
          userApi.getFriends(id).catch(() => ({ data: [] }))
        ])
        setUser(userData.data || userData)
        setEvents(eventData.data || [])
        setFriends(friendData.data || [])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

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
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted">
              <User className="h-12 w-12" />
            </div>
            <CardTitle className="mt-4 text-xl">{user.first_name} {user.last_name}</CardTitle>
            <CardDescription>@{user.username}</CardDescription>
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
    </div>
  )
}
