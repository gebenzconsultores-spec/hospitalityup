'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { translations } from '@/lib/i18n'
import { mockBookings, mockInstructors, mockCourses, mockProperties, regions } from '@/lib/mock-data'
import type { Booking, Instructor } from '@/lib/mock-data'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

import {
  CalendarIcon,
  Monitor,
  MapPin,
  Users,
  User,
  Plus,
  Star,
  Clock,
  DollarSign,
  CheckCircle2,
  XCircle,
  ChevronDown,
  Building2,
} from 'lucide-react'

import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale/es'
import { enUS } from 'date-fns/locale/en-US'

function formatDate(dateStr: string, locale: 'es' | 'en') {
  try {
    const date = parseISO(dateStr)
    return format(date, 'PPP', { locale: locale === 'es' ? es : enUS })
  } catch {
    return dateStr
  }
}

function formatTime(dateStr: string, locale: 'es' | 'en') {
  try {
    const date = parseISO(dateStr)
    return format(date, 'p', { locale: locale === 'es' ? es : enUS })
  } catch {
    return ''
  }
}

function StatusBadge({ status, t }: { status: Booking['status']; t: typeof translations.es }) {
  const config = {
    pending: { label: t.bookings.pending, className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200' },
    confirmed: { label: t.bookings.confirmed, className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200' },
    completed: { label: t.bookings.completed, className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200' },
    cancelled: { label: t.bookings.cancelled, className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200' },
  }
  const c = config[status]
  return <Badge variant="outline" className={c.className}>{c.label}</Badge>
}

function ModalityBadge({ modality, t }: { modality: Booking['modality']; t: typeof translations.es }) {
  if (modality === 'virtual') {
    return (
      <Badge variant="outline" className="bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400 border-sky-200 gap-1">
        <Monitor className="h-3 w-3" />
        {t.bookings.virtual}
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 gap-1">
      <MapPin className="h-3 w-3" />
      {t.bookings.inPerson}
    </Badge>
  )
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-3.5 w-3.5 ${star <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`}
        />
      ))}
      <span className="ml-1 text-sm font-medium">{rating.toFixed(1)}</span>
    </div>
  )
}

// ─── Upcoming Bookings Tab ─────────────────────────────────────────────
function UpcomingBookingsTab({ t, locale }: { t: typeof translations.es; locale: 'es' | 'en' }) {
  const [bookings, setBookings] = useState(mockBookings)
  const upcoming = bookings.filter((b) => b.status === 'pending' || b.status === 'confirmed')

  const handleConfirm = (id: string) => {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: 'confirmed' as const } : b)))
    toast.success(t.bookings.bookingConfirmed)
  }

  const handleCancel = (id: string) => {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: 'cancelled' as const } : b)))
    toast.success(t.bookings.bookingCancelled)
  }

  const stats = {
    total: upcoming.length,
    pending: upcoming.filter((b) => b.status === 'pending').length,
    confirmed: upcoming.filter((b) => b.status === 'confirmed').length,
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <CalendarIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t.bookings.totalBookings}</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
              <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t.bookings.pendingCount}</p>
              <p className="text-2xl font-bold">{stats.pending}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t.bookings.confirmedCount}</p>
              <p className="text-2xl font-bold">{stats.confirmed}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cards */}
      {upcoming.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <CalendarIcon className="h-12 w-12 text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">{t.bookings.noUpcoming}</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {upcoming.map((booking) => (
            <Card key={booking.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base leading-tight">
                    {locale === 'en' ? booking.courseTitleEn : booking.courseTitle}
                  </CardTitle>
                  <StatusBadge status={booking.status} t={t} />
                </div>
                <CardDescription className="sr-only">
                  {locale === 'en' ? booking.courseTitleEn : booking.courseTitle}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <ModalityBadge modality={booking.modality} t={t} />
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CalendarIcon className="h-4 w-4 shrink-0" />
                    <span>{formatDate(booking.date, locale)}</span>
                    <span className="text-muted-foreground/60">·</span>
                    <Clock className="h-3.5 w-3.5 shrink-0" />
                    <span>{formatTime(booking.date, locale)}</span>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building2 className="h-4 w-4 shrink-0" />
                    <span>{booking.propertyName}</span>
                  </div>

                  {booking.instructorName && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="h-4 w-4 shrink-0" />
                      <span>{booking.instructorName}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4 shrink-0" />
                    <span>{booking.participants} {t.bookings.participants.toLowerCase()}</span>
                  </div>

                  {booking.cost && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <DollarSign className="h-4 w-4 shrink-0" />
                      <span>${booking.cost.toLocaleString()} {t.common.mxn}</span>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="flex gap-2">
                  {booking.status === 'pending' && (
                    <Button size="sm" className="flex-1" onClick={() => handleConfirm(booking.id)}>
                      <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                      {t.bookings.confirmBooking}
                    </Button>
                  )}
                  {(booking.status === 'pending' || booking.status === 'confirmed') && (
                    <Button size="sm" variant="outline" className="flex-1 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/30" onClick={() => handleCancel(booking.id)}>
                      <XCircle className="mr-1 h-3.5 w-3.5" />
                      {t.bookings.cancelBooking}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Past Bookings Tab ──────────────────────────────────────────────────
function PastBookingsTab({ t, locale }: { t: typeof translations.es; locale: 'es' | 'en' }) {
  const past = mockBookings.filter((b) => b.status === 'completed' || b.status === 'cancelled')

  if (past.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Clock className="h-12 w-12 text-muted-foreground/30 mb-3" />
        <p className="text-muted-foreground">{t.bookings.noPast}</p>
      </div>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.bookings.course}</TableHead>
                <TableHead>{t.bookings.date}</TableHead>
                <TableHead className="hidden sm:table-cell">{t.bookings.property}</TableHead>
                <TableHead className="hidden md:table-cell">{t.bookings.instructor}</TableHead>
                <TableHead className="hidden lg:table-cell">{t.bookings.participants}</TableHead>
                <TableHead>{t.bookings.status}</TableHead>
                <TableHead className="hidden sm:table-cell">{t.bookings.cost}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {past.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col gap-1">
                      <span>{locale === 'en' ? booking.courseTitleEn : booking.courseTitle}</span>
                      <ModalityBadge modality={booking.modality} t={t} />
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    <div>{formatDate(booking.date, locale)}</div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-sm">{booking.propertyName}</TableCell>
                  <TableCell className="hidden md:table-cell text-sm">
                    {booking.instructorName || <span className="text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm">{booking.participants}</TableCell>
                  <TableCell><StatusBadge status={booking.status} t={t} /></TableCell>
                  <TableCell className="hidden sm:table-cell text-sm">
                    {booking.cost ? `$${booking.cost.toLocaleString()} ${t.common.mxn}` : <span className="text-muted-foreground">—</span>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Instructors Tab ────────────────────────────────────────────────────
function InstructorsTab({ t }: { t: typeof translations.es }) {
  const [regionFilter, setRegionFilter] = useState('all')
  const filtered = regionFilter === 'all'
    ? mockInstructors
    : mockInstructors.filter((i) => i.region === regionFilter)

  return (
    <div className="space-y-4">
      {/* Region filter */}
      <div className="flex items-center gap-2">
        <Select value={regionFilter} onValueChange={setRegionFilter}>
          <SelectTrigger className="w-[220px]">
            <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder={t.bookings.filterByRegion} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.bookings.allRegions}</SelectItem>
            {regions.map((r) => (
              <SelectItem key={r.id} value={r.id}>
                {t === translations.es ? r.name : r.nameEn}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Instructor cards grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <User className="h-12 w-12 text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">{t.common.noData}</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((instructor) => (
            <InstructorCard key={instructor.id} instructor={instructor} t={t} />
          ))}
        </div>
      )}
    </div>
  )
}

function InstructorCard({ instructor, t }: { instructor: Instructor; t: typeof translations.es }) {
  const initials = instructor.name.split(' ').map((n) => n[0]).join('')
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12 border">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{instructor.name}</h3>
            <p className="text-sm text-muted-foreground">{instructor.specialty}</p>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
              <MapPin className="h-3.5 w-3.5" />
              <span>{instructor.location}</span>
            </div>
          </div>
          <Badge variant="outline" className={
            instructor.available
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 shrink-0'
              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 shrink-0'
          }>
            {instructor.available ? t.bookings.available : t.bookings.unavailable}
          </Badge>
        </div>
        <Separator className="my-3" />
        <div className="flex items-center justify-between">
          <StarRating rating={instructor.rating} />
          <div className="flex items-center gap-1 text-sm font-medium">
            <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
            <span>${instructor.hourlyRate}/{t === translations.es ? 'hr' : 'hr'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── New Booking Dialog ─────────────────────────────────────────────────
function NewBookingDialog({ t, locale }: { t: typeof translations.es; locale: 'es' | 'en' }) {
  const [open, setOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState('')
  const [selectedProperty, setSelectedProperty] = useState('')
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedModality, setSelectedModality] = useState('')
  const [participants, setParticipants] = useState('')
  const [notes, setNotes] = useState('')

  const resetForm = () => {
    setSelectedCourse('')
    setSelectedProperty('')
    setSelectedDate(undefined)
    setSelectedModality('')
    setParticipants('')
    setNotes('')
  }

  const handleSubmit = () => {
    setOpen(false)
    resetForm()
    toast.success(t.bookings.bookingCreated)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm() }}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          {t.bookings.newBooking}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t.bookings.newBooking}</DialogTitle>
          <DialogDescription>
            {locale === 'es'
              ? 'Completa los detalles para crear una nueva reserva de capacitación.'
              : 'Fill in the details to create a new training booking.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Course */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t.bookings.course}</label>
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger>
                <SelectValue placeholder={t.bookings.selectCourse} />
              </SelectTrigger>
              <SelectContent>
                {mockCourses.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {locale === 'en' ? c.titleEn : c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Property */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t.bookings.property}</label>
            <Select value={selectedProperty} onValueChange={setSelectedProperty}>
              <SelectTrigger>
                <SelectValue placeholder={t.bookings.selectProperty} />
              </SelectTrigger>
              <SelectContent>
                {mockProperties.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {locale === 'en' ? p.nameEn : p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t.bookings.date}</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, 'PPP', { locale: locale === 'es' ? es : enUS }) : t.bookings.selectDate}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Modality */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t.bookings.modality}</label>
            <Select value={selectedModality} onValueChange={setSelectedModality}>
              <SelectTrigger>
                <SelectValue placeholder={t.bookings.selectModality} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="virtual">
                  <span className="flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    {t.bookings.virtual}
                  </span>
                </SelectItem>
                <SelectItem value="in_person">
                  <span className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {t.bookings.inPerson}
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Participants */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t.bookings.participants}</label>
            <Input
              type="number"
              min={1}
              placeholder="0"
              value={participants}
              onChange={(e) => setParticipants(e.target.value)}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t.bookings.notes}</label>
            <Textarea
              placeholder={t.bookings.notesPlaceholder}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => { setOpen(false); resetForm() }}>
            {t.common.cancel}
          </Button>
          <Button onClick={handleSubmit} disabled={!selectedCourse || !selectedProperty || !selectedDate || !selectedModality}>
            {t.bookings.createBooking}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Main Bookings Module ───────────────────────────────────────────────
export function BookingsModule() {
  const { locale } = useAppStore()
  const t = translations[locale]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t.bookings.title}</h1>
          <p className="text-muted-foreground">
            {locale === 'es'
              ? 'Gestiona las reservas de capacitación presenciales y virtuales'
              : 'Manage in-person and virtual training bookings'}
          </p>
        </div>
        <NewBookingDialog t={t} locale={locale} />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upcoming" className="gap-1.5">
            <CalendarIcon className="h-4 w-4 hidden sm:inline-block" />
            {t.bookings.upcoming}
          </TabsTrigger>
          <TabsTrigger value="past" className="gap-1.5">
            <Clock className="h-4 w-4 hidden sm:inline-block" />
            {t.bookings.past}
          </TabsTrigger>
          <TabsTrigger value="instructors" className="gap-1.5">
            <User className="h-4 w-4 hidden sm:inline-block" />
            {t.bookings.instructors}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="mt-4">
          <UpcomingBookingsTab t={t} locale={locale} />
        </TabsContent>
        <TabsContent value="past" className="mt-4">
          <PastBookingsTab t={t} locale={locale} />
        </TabsContent>
        <TabsContent value="instructors" className="mt-4">
          <InstructorsTab t={t} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
