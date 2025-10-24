import { useState, useEffect } from 'react'
import Icon from '@/components/ui/icon'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'

interface User {
  id: number
  username: string
  display_name: string
  avatar_url: string
  bio: string
  is_online?: boolean
}

interface Track {
  id: number
  user_id: number
  title: string
  artist: string
  audio_url: string
  cover_url: string
  comments: Comment[]
  isLiked: boolean
}

interface Comment {
  id: number
  user: User
  content: string
}

interface Chat {
  id: number
  user: User
  lastMessage: string
  unread: number
}

interface Message {
  id: number
  sender_id: number
  content: string
  timestamp: string
}

const ALL_USERS: User[] = [
  { id: 2, username: 'beatmaker', display_name: 'BeatMaker', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=beatmaker', bio: 'Creating beats since 2015', is_online: true },
  { id: 3, username: 'vocalize', display_name: 'Vocalize', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=vocalize', bio: 'Singer & Songwriter', is_online: false },
  { id: 4, username: 'synthwave', display_name: 'SynthWave', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=synthwave', bio: 'Retro vibes producer', is_online: true },
  { id: 5, username: 'bassline', display_name: 'BassLine', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bassline', bio: 'Bass music lover', is_online: true },
  { id: 6, username: 'melody', display_name: 'MelodyQueen', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=melody', bio: 'Piano & vocals', is_online: false },
]

function Index() {
  const [isRegistered, setIsRegistered] = useState(false)
  const [showRegistration, setShowRegistration] = useState(true)
  const [registrationData, setRegistrationData] = useState({ username: '', display_name: '' })
  
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [tracks, setTracks] = useState<Track[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [userSearchQuery, setUserSearchQuery] = useState('')
  
  const [chats, setChats] = useState<Chat[]>([])
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')

  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null)

  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [newTrack, setNewTrack] = useState({ title: '', artist: '', file: null as File | null, coverFile: null as File | null })
  const [editProfileOpen, setEditProfileOpen] = useState(false)
  const [newAvatar, setNewAvatar] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('tsound_user')
    if (saved) {
      const user = JSON.parse(saved)
      setCurrentUser(user)
      setIsRegistered(true)
      setShowRegistration(false)
    }
  }, [])

  useEffect(() => {
    const audio = new Audio()
    setAudioElement(audio)
    
    return () => {
      audio.pause()
      audio.src = ''
    }
  }, [])

  useEffect(() => {
    if (audioElement && currentTrack) {
      audioElement.src = currentTrack.audio_url
      if (isPlaying) {
        audioElement.play()
      } else {
        audioElement.pause()
      }
    }
  }, [currentTrack, isPlaying, audioElement])

  const handleRegistration = () => {
    if (!registrationData.username || !registrationData.display_name) return
    
    const user: User = {
      id: 1,
      username: registrationData.username,
      display_name: registrationData.display_name,
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${registrationData.username}`,
      bio: 'Новый пользователь TSound',
      is_online: true
    }
    
    localStorage.setItem('tsound_user', JSON.stringify(user))
    setCurrentUser(user)
    setIsRegistered(true)
    setShowRegistration(false)
  }

  const toggleLike = (trackId: number) => {
    setTracks(tracks.map(track => 
      track.id === trackId 
        ? { ...track, isLiked: !track.isLiked }
        : track
    ))
  }

  const addComment = (trackId: number, content: string) => {
    if (!content.trim() || !currentUser) return
    
    setTracks(tracks.map(track => 
      track.id === trackId 
        ? { 
            ...track, 
            comments: [...track.comments, {
              id: Date.now(),
              user: currentUser,
              content
            }]
          }
        : track
    ))
  }

  const playTrack = (track: Track) => {
    if (currentTrack?.id === track.id) {
      setIsPlaying(!isPlaying)
    } else {
      setCurrentTrack(track)
      setIsPlaying(true)
    }
  }

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedChat || !currentUser) return
    
    const message: Message = {
      id: Date.now(),
      sender_id: currentUser.id,
      content: newMessage,
      timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    }
    
    setMessages([...messages, message])
    setNewMessage('')
  }

  const uploadImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = async () => {
        try {
          const base64Image = reader.result as string
          const response = await fetch('https://functions.poehali.dev/1510f878-5b70-4e47-b71a-74ca9388657a', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: base64Image })
          })
          const data = await response.json()
          resolve(data.url)
        } catch (error) {
          reject(error)
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const handleUpload = async () => {
    if (!newTrack.title || !newTrack.artist || !currentUser) return
    
    setUploading(true)
    let coverUrl = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400'
    
    if (newTrack.coverFile) {
      try {
        coverUrl = await uploadImage(newTrack.coverFile)
      } catch (error) {
        console.error('Failed to upload cover:', error)
      }
    }
    
    const track: Track = {
      id: Date.now(),
      user_id: currentUser.id,
      title: newTrack.title,
      artist: newTrack.artist,
      audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      cover_url: coverUrl,
      isLiked: false,
      comments: []
    }
    
    setTracks([track, ...tracks])
    setNewTrack({ title: '', artist: '', file: null, coverFile: null })
    setUploadDialogOpen(false)
    setUploading(false)
  }

  const handleAvatarUpdate = async () => {
    if (!newAvatar || !currentUser) return
    
    setUploading(true)
    try {
      const avatarUrl = await uploadImage(newAvatar)
      const updatedUser = { ...currentUser, avatar_url: avatarUrl }
      setCurrentUser(updatedUser)
      localStorage.setItem('tsound_user', JSON.stringify(updatedUser))
    } catch (error) {
      console.error('Failed to upload avatar:', error)
    }
    setUploading(false)
    setEditProfileOpen(false)
    setNewAvatar(null)
  }

  const startChat = (user: User) => {
    const existingChat = chats.find(c => c.user.id === user.id)
    if (existingChat) {
      setSelectedChat(existingChat)
    } else {
      const newChat: Chat = {
        id: Date.now(),
        user: user,
        lastMessage: '',
        unread: 0
      }
      setChats([newChat, ...chats])
      setSelectedChat(newChat)
      setMessages([])
    }
  }

  const filteredTracks = tracks.filter(track => 
    track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.artist.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredUsers = ALL_USERS.filter(user => 
    user.display_name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(userSearchQuery.toLowerCase())
  )

  if (showRegistration) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 bg-card border-border">
          <div className="text-center mb-8">
            <img src="https://cdn.poehali.dev/files/2ab35a3e-2c21-4cfb-bee7-7bb9d2d42f71.jpg" alt="TSound" className="h-16 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-foreground mb-2">Добро пожаловать в TSound</h1>
            <p className="text-muted-foreground">Создай свой профиль и начни делиться музыкой</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="username" className="text-foreground">Имя пользователя</Label>
              <Input 
                id="username"
                value={registrationData.username}
                onChange={(e) => setRegistrationData({...registrationData, username: e.target.value})}
                placeholder="@username"
                className="bg-background border-border text-foreground mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="display_name" className="text-foreground">Отображаемое имя</Label>
              <Input 
                id="display_name"
                value={registrationData.display_name}
                onChange={(e) => setRegistrationData({...registrationData, display_name: e.target.value})}
                placeholder="Ваше имя"
                className="bg-background border-border text-foreground mt-1"
              />
            </div>
            
            <Button 
              onClick={handleRegistration} 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={!registrationData.username || !registrationData.display_name}
            >
              Начать
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  if (!currentUser) return null

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="https://cdn.poehali.dev/files/2ab35a3e-2c21-4cfb-bee7-7bb9d2d42f71.jpg" alt="TSound" className="h-12 w-auto" />
            </div>
            
            <div className="flex items-center gap-3">
              <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                <Button onClick={() => setUploadDialogOpen(true)} size="icon" className="rounded-full bg-primary hover:bg-primary/90">
                  <Icon name="Plus" size={24} />
                </Button>
                <DialogContent className="bg-card border-border">
                  <DialogHeader>
                    <DialogTitle className="text-foreground">Загрузить трек</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="title" className="text-foreground">Название</Label>
                      <Input 
                        id="title" 
                        value={newTrack.title}
                        onChange={(e) => setNewTrack({...newTrack, title: e.target.value})}
                        placeholder="Введите название трека"
                        className="bg-background border-border text-foreground mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="artist" className="text-foreground">Артист</Label>
                      <Input 
                        id="artist"
                        value={newTrack.artist}
                        onChange={(e) => setNewTrack({...newTrack, artist: e.target.value})}
                        placeholder="Введите имя артиста"
                        className="bg-background border-border text-foreground mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cover" className="text-foreground">Обложка трека (фото)</Label>
                      <Input 
                        id="cover"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setNewTrack({...newTrack, coverFile: e.target.files?.[0] || null})}
                        className="bg-background border-border text-foreground mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="file" className="text-foreground">MP3 файл</Label>
                      <Input 
                        id="file"
                        type="file"
                        accept="audio/mp3,audio/mpeg"
                        onChange={(e) => setNewTrack({...newTrack, file: e.target.files?.[0] || null})}
                        className="bg-background border-border text-foreground mt-1"
                      />
                    </div>
                    <Button onClick={handleUpload} disabled={uploading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                      {uploading ? 'Загрузка...' : 'Загрузить'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
                <button onClick={() => setEditProfileOpen(true)}>
                  <Avatar className="h-10 w-10 border-2 border-primary cursor-pointer hover:opacity-80 transition-opacity">
                    <AvatarImage src={currentUser.avatar_url} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {currentUser.display_name[0]}
                    </AvatarFallback>
                  </Avatar>
                </button>
                <DialogContent className="bg-card border-border">
                  <DialogHeader>
                    <DialogTitle className="text-foreground">Изменить аватар</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div className="flex justify-center">
                      <Avatar className="h-32 w-32 border-4 border-primary">
                        <AvatarImage src={currentUser.avatar_url} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-4xl">
                          {currentUser.display_name[0]}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div>
                      <Label htmlFor="avatar" className="text-foreground">Выбрать новое фото</Label>
                      <Input 
                        id="avatar"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setNewAvatar(e.target.files?.[0] || null)}
                        className="bg-background border-border text-foreground mt-1"
                      />
                    </div>
                    <Button onClick={handleAvatarUpdate} disabled={uploading || !newAvatar} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                      {uploading ? 'Загрузка...' : 'Сохранить'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 pb-32">
        <Tabs defaultValue="feed" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-card border border-border mb-6">
            <TabsTrigger value="feed" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Icon name="Music" size={20} className="mr-2" />
              Лента
            </TabsTrigger>
            <TabsTrigger value="profile" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Icon name="User" size={20} className="mr-2" />
              Профиль
            </TabsTrigger>
            <TabsTrigger value="chats" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Icon name="MessageCircle" size={20} className="mr-2" />
              Чаты
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="relative flex-1">
                <Icon name="Search" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Поиск треков..."
                  className="bg-card border-border text-foreground pl-10"
                />
              </div>
            </div>

            {filteredTracks.length === 0 ? (
              <Card className="p-12 bg-card border-border text-center">
                <Icon name="Music" size={64} className="mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground text-lg">Пока нет треков</p>
                <p className="text-muted-foreground text-sm mt-2">Нажми "+" чтобы загрузить свою музыку</p>
              </Card>
            ) : (
              filteredTracks.map((track) => (
                <Card key={track.id} className="p-6 bg-card border-border animate-fade-in">
                  <div className="flex gap-4">
                    <img 
                      src={track.cover_url} 
                      alt={track.title}
                      className="w-32 h-32 rounded-lg object-cover"
                    />
                    
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-foreground mb-1">{track.title}</h3>
                      <p className="text-muted-foreground mb-3">{track.artist}</p>
                      
                      <div className="flex items-center gap-3 mb-4">
                        <Button 
                          size="icon" 
                          variant="ghost"
                          onClick={() => playTrack(track)}
                          className="hover:bg-primary/20"
                        >
                          <Icon name={currentTrack?.id === track.id && isPlaying ? "Pause" : "Play"} size={24} className="text-primary" />
                        </Button>
                        
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => toggleLike(track.id)}
                          className={`gap-2 ${track.isLiked ? 'text-primary' : 'text-muted-foreground'} hover:text-primary`}
                        >
                          <Icon name="Heart" size={20} className={track.isLiked ? 'fill-current' : ''} />
                          {track.isLiked ? 1 : 0}
                        </Button>
                        
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="gap-2 text-muted-foreground hover:text-primary"
                        >
                          <Icon name="MessageCircle" size={20} />
                          {track.comments.length}
                        </Button>
                      </div>

                      <div className="space-y-3">
                        {track.comments.map((comment) => (
                          <div key={comment.id} className="flex gap-3 bg-background/50 rounded-lg p-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={comment.user.avatar_url} />
                              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                {comment.user.display_name[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium text-foreground">{comment.user.display_name}</p>
                              <p className="text-sm text-muted-foreground">{comment.content}</p>
                            </div>
                          </div>
                        ))}
                        
                        <div className="flex gap-2">
                          <Input 
                            placeholder="Написать комментарий..."
                            className="bg-background border-border text-foreground"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                addComment(track.id, e.currentTarget.value)
                                e.currentTarget.value = ''
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="profile">
            <Card className="p-8 bg-card border-border text-center animate-fade-in">
              <Avatar className="h-32 w-32 mx-auto mb-4 border-4 border-primary">
                <AvatarImage src={currentUser.avatar_url} />
                <AvatarFallback className="bg-primary text-primary-foreground text-4xl">
                  {currentUser.display_name[0]}
                </AvatarFallback>
              </Avatar>
              
              <h2 className="text-2xl font-bold text-foreground mb-2">{currentUser.display_name}</h2>
              <p className="text-muted-foreground mb-6">@{currentUser.username}</p>
              <p className="text-foreground mb-6">{currentUser.bio}</p>
              
              <div className="grid grid-cols-3 gap-6 max-w-md mx-auto">
                <div>
                  <p className="text-3xl font-bold text-primary">{tracks.filter(t => t.user_id === currentUser.id).length}</p>
                  <p className="text-sm text-muted-foreground">Треков</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary">0</p>
                  <p className="text-sm text-muted-foreground">Подписчики</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary">0</p>
                  <p className="text-sm text-muted-foreground">Подписки</p>
                </div>
              </div>
              
              <div className="mt-8">
                <h3 className="text-xl font-semibold text-foreground mb-4">Мои треки</h3>
                {tracks.filter(t => t.user_id === currentUser.id).length === 0 ? (
                  <p className="text-muted-foreground">У вас пока нет треков</p>
                ) : (
                  <div className="space-y-4">
                    {tracks.filter(t => t.user_id === currentUser.id).map((track) => (
                      <div key={track.id} className="flex items-center gap-4 p-4 bg-background rounded-lg">
                        <img src={track.cover_url} alt={track.title} className="w-16 h-16 rounded" />
                        <div className="flex-1 text-left">
                          <p className="font-medium text-foreground">{track.title}</p>
                          <p className="text-sm text-muted-foreground">{track.artist}</p>
                        </div>
                        <div className="flex items-center gap-4 text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Icon name="Heart" size={16} />
                            <span className="text-sm">{track.isLiked ? 1 : 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Icon name="MessageCircle" size={16} />
                            <span className="text-sm">{track.comments.length}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="chats">
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="md:col-span-1 p-4 bg-card border-border animate-fade-in">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-foreground mb-3">Все пользователи</h3>
                  <div className="relative">
                    <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input 
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      placeholder="Поиск пользователей..."
                      className="bg-background border-border text-foreground pl-9 text-sm"
                    />
                  </div>
                </div>
                
                <ScrollArea className="h-[500px]">
                  <div className="space-y-2">
                    {filteredUsers.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => startChat(user)}
                        className="w-full flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-background"
                      >
                        <div className="relative">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={user.avatar_url} />
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {user.display_name[0]}
                            </AvatarFallback>
                          </Avatar>
                          {user.is_online && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
                          )}
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-medium text-foreground">{user.display_name}</p>
                          <p className="text-sm text-muted-foreground">@{user.username}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </Card>

              <Card className="md:col-span-2 p-4 bg-card border-border animate-fade-in">
                {selectedChat ? (
                  <div className="flex flex-col h-[500px]">
                    <div className="flex items-center gap-3 pb-4 border-b border-border">
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={selectedChat.user.avatar_url} />
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {selectedChat.user.display_name[0]}
                          </AvatarFallback>
                        </Avatar>
                        {selectedChat.user.is_online && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{selectedChat.user.display_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedChat.user.is_online ? 'В сети' : 'Не в сети'}
                        </p>
                      </div>
                    </div>

                    <ScrollArea className="flex-1 py-4">
                      <div className="space-y-4">
                        {messages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex ${msg.sender_id === currentUser.id ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[70%] rounded-lg p-3 ${
                                msg.sender_id === currentUser.id
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-background text-foreground'
                              }`}
                            >
                              <p>{msg.content}</p>
                              <p className="text-xs opacity-70 mt-1">{msg.timestamp}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>

                    <div className="flex gap-2 pt-4 border-t border-border">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Написать сообщение..."
                        className="bg-background border-border text-foreground"
                      />
                      <Button onClick={sendMessage} size="icon" className="bg-primary hover:bg-primary/90">
                        <Icon name="Send" size={20} />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="h-[500px] flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Icon name="MessageCircle" size={64} className="mx-auto mb-4 opacity-50" />
                      <p>Выберите пользователя для начала общения</p>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {currentTrack && (
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 animate-slide-in-right z-50">
          <div className="container mx-auto flex items-center gap-4">
            <img src={currentTrack.cover_url} alt={currentTrack.title} className="w-16 h-16 rounded" />
            <div className="flex-1">
              <p className="font-semibold text-foreground">{currentTrack.title}</p>
              <p className="text-sm text-muted-foreground">{currentTrack.artist}</p>
            </div>
            <div className="flex items-center gap-3">
              <Button size="icon" variant="ghost" className="hover:bg-primary/20">
                <Icon name="SkipBack" size={20} className="text-primary" />
              </Button>
              <Button 
                size="icon" 
                onClick={() => setIsPlaying(!isPlaying)}
                className="bg-primary hover:bg-primary/90"
              >
                <Icon name={isPlaying ? "Pause" : "Play"} size={24} />
              </Button>
              <Button size="icon" variant="ghost" className="hover:bg-primary/20">
                <Icon name="SkipForward" size={20} className="text-primary" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Index
