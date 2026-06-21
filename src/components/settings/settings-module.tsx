'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { translations } from '@/lib/i18n'
import type { Locale } from '@/lib/i18n'
import { mockProperties, pricingPlans, regions } from '@/lib/mock-data'
import type { Property } from '@/lib/mock-data'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

import {
  Building2,
  MapPin,
  Edit3,
  Check,
  Crown,
  Star,
  Globe,
  Bell,
  Link2,
  CreditCard,
  ShoppingCart,
  Zap,
  Languages,
  Settings2,
} from 'lucide-react'

// ─── Properties Tab ─────────────────────────────────────────────────────
function PropertiesTab({ t, locale }: { t: typeof translations.es; locale: Locale }) {
  const typeIcons: Record<string, string> = { hotel: '🏨', restaurant: '🍽️', bar: '🍸' }
  const planColors: Record<string, string> = {
    boutique: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200',
    growth: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400 border-sky-200',
    enterprise: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200',
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {mockProperties.map((property) => (
        <Card key={property.id} className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{typeIcons[property.type] || '🏢'}</span>
                <div>
                  <CardTitle className="text-base">{locale === 'en' ? property.nameEn : property.name}</CardTitle>
                  <CardDescription className="sr-only">
                    {locale === 'en' ? property.nameEn : property.name}
                  </CardDescription>
                </div>
              </div>
              <Badge variant="outline" className={
                property.active
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 shrink-0'
                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 shrink-0'
              }>
                {property.active ? t.settings.active : t.settings.inactive}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Building2 className="h-4 w-4 shrink-0" />
              <span>{t.settings[property.type as keyof typeof t.settings] || property.type}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0" />
              <span>{property.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={planColors[property.plan] || ''}>
                <Crown className="mr-1 h-3 w-3" />
                {property.plan.charAt(0).toUpperCase() + property.plan.slice(1)}
              </Badge>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" className="w-full" onClick={() => toast.info(locale === 'es' ? 'Editar propiedad (demo)' : 'Edit property (demo)')}>
              <Edit3 className="mr-2 h-3.5 w-3.5" />
              {t.settings.editProperty}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

// ─── Pricing Plans Tab ──────────────────────────────────────────────────
function PricingPlansTab({ t, locale }: { t: typeof translations.es; locale: Locale }) {
  const planIcons: Record<string, React.ReactNode> = {
    plan1: <Star className="h-6 w-6" />,
    plan2: <Zap className="h-6 w-6" />,
    plan3: <Crown className="h-6 w-6" />,
  }
  const planAccent: Record<string, string> = {
    plan1: 'border-amber-200 dark:border-amber-800',
    plan2: 'border-primary shadow-lg shadow-primary/10',
    plan3: 'border-purple-200 dark:border-purple-800',
  }
  const planIconBg: Record<string, string> = {
    plan1: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    plan2: 'bg-primary/10 text-primary',
    plan3: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {pricingPlans.map((plan) => (
        <Card
          key={plan.id}
          className={`relative overflow-hidden ${planAccent[plan.id] || ''} ${plan.popular ? 'scale-[1.02]' : ''}`}
        >
          {plan.popular && (
            <div className="absolute top-0 right-0">
              <div className="rounded-bl-lg bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                {t.settings.popular}
              </div>
            </div>
          )}
          <CardHeader className="pb-2">
            <div className={`mb-2 flex h-12 w-12 items-center justify-center rounded-xl ${planIconBg[plan.id] || 'bg-muted'}`}>
              {planIcons[plan.id]}
            </div>
            <CardTitle className="text-xl">{plan.nameEn}</CardTitle>
            <CardDescription className="text-sm">
              {locale === 'en' ? plan.targetMarketEn : plan.targetMarket}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Pricing */}
            <div className="space-y-1">
              {plan.setupFee > 0 ? (
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">${plan.setupFee.toLocaleString()}</span>
                  <span className="text-sm text-muted-foreground">{t.common.mxn} {t.settings.oneTime}</span>
                </div>
              ) : (
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-medium text-muted-foreground">
                    {locale === 'es' ? 'Sin costo de instalación' : 'No setup fee'}
                  </span>
                </div>
              )}
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">${plan.monthlyFee.toLocaleString()}</span>
                <span className="text-sm text-muted-foreground">{t.common.mxn}{t.settings.perMonth}</span>
              </div>
            </div>

            <Separator />

            {/* Features */}
            <ul className="space-y-2.5">
              {(locale === 'en' ? plan.featuresEn : plan.features).map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              variant={plan.popular ? 'default' : 'outline'}
              onClick={() => toast.success(locale === 'es' ? `Plan ${plan.nameEn} seleccionado` : `${plan.nameEn} plan selected`)}
            >
              {t.settings.choosePlan}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

// ─── General Tab ────────────────────────────────────────────────────────
function GeneralTab({ t, locale }: { t: typeof translations.es; locale: Locale }) {
  const { setLocale } = useAppStore()
  const [selectedRegion, setSelectedRegion] = useState('cancun')
  const [emailNotif, setEmailNotif] = useState(true)
  const [pushNotif, setPushNotif] = useState(true)
  const [bookingNotif, setBookingNotif] = useState(true)
  const [turnoverNotif, setTurnoverNotif] = useState(false)

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Language */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Languages className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">{t.settings.language}</CardTitle>
          </div>
          <CardDescription>{t.settings.languageDesc}</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={locale} onValueChange={(v) => setLocale(v as Locale)}>
            <SelectTrigger className="w-[220px]">
              <Globe className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="es">{t.settings.spanish}</SelectItem>
              <SelectItem value="en">{t.settings.english}</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Region */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">{t.settings.region}</CardTitle>
          </div>
          <CardDescription>{t.settings.regionDesc}</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger className="w-[220px]">
              <Globe className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {regions.map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  {locale === 'en' ? r.nameEn : r.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">{t.settings.notifications}</CardTitle>
          </div>
          <CardDescription>{t.settings.notifDesc}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{t.settings.emailNotif}</p>
              <p className="text-xs text-muted-foreground">Email</p>
            </div>
            <Switch checked={emailNotif} onCheckedChange={setEmailNotif} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{t.settings.pushNotif}</p>
              <p className="text-xs text-muted-foreground">Push</p>
            </div>
            <Switch checked={pushNotif} onCheckedChange={setPushNotif} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{t.settings.bookingNotif}</p>
              <p className="text-xs text-muted-foreground">Bookings</p>
            </div>
            <Switch checked={bookingNotif} onCheckedChange={setBookingNotif} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{t.settings.turnoverNotif}</p>
              <p className="text-xs text-muted-foreground">Turnover</p>
            </div>
            <Switch checked={turnoverNotif} onCheckedChange={setTurnoverNotif} />
          </div>
        </CardContent>
      </Card>

      {/* Integrations */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">{t.settings.integrations}</CardTitle>
          </div>
          <CardDescription>{t.settings.integrationDesc}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Stripe */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30">
                <CreditCard className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <p className="text-sm font-medium">Stripe</p>
                <p className="text-xs text-muted-foreground">{t.settings.stripeDesc}</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200">
              <Check className="mr-1 h-3 w-3" />
              {t.settings.connected}
            </Badge>
          </div>
          <Separator />
          {/* POS */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-900/30">
                <ShoppingCart className="h-5 w-5 text-sky-600 dark:text-sky-400" />
              </div>
              <div>
                <p className="text-sm font-medium">POS Systems</p>
                <p className="text-xs text-muted-foreground">{t.settings.posDesc}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => toast.info(locale === 'es' ? 'Conectar POS (demo)' : 'Connect POS (demo)')}>
              {t.settings.connect}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Main Settings Module ───────────────────────────────────────────────
export function SettingsModule() {
  const { locale } = useAppStore()
  const t = translations[locale]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t.settings.title}</h1>
        <p className="text-muted-foreground">
          {locale === 'es'
            ? 'Administra propiedades, planes de precios y configuración general'
            : 'Manage properties, pricing plans and general settings'}
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="properties" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="properties" className="gap-1.5">
            <Building2 className="h-4 w-4 hidden sm:inline-block" />
            {t.settings.properties}
          </TabsTrigger>
          <TabsTrigger value="pricing" className="gap-1.5">
            <Crown className="h-4 w-4 hidden sm:inline-block" />
            {t.settings.pricingPlans}
          </TabsTrigger>
          <TabsTrigger value="general" className="gap-1.5">
            <Settings2 className="h-4 w-4 hidden sm:inline-block" />
            {t.settings.general}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="properties" className="mt-4">
          <PropertiesTab t={t} locale={locale} />
        </TabsContent>
        <TabsContent value="pricing" className="mt-4">
          <PricingPlansTab t={t} locale={locale} />
        </TabsContent>
        <TabsContent value="general" className="mt-4">
          <GeneralTab t={t} locale={locale} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
