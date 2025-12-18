import React, { FunctionComponent, useCallback, useEffect, useState } from 'react'
import { TFunction, useTranslation } from 'react-i18next'
import { useLocation } from 'react-router'
import { useHistory, useParams } from 'react-router-dom'
import BroadcastMessageForm from './components/BroadcastMessageForm'
import { Card, CardContent } from '~/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'

interface OwnProps { }

type Props = OwnProps

interface TabConfig {
  key: string
  label: string
  content: React.ReactNode
}

const getTabsConfig = (t: TFunction<'admin'>): TabConfig[] => [
  {
    key: 'notifications',
    label: t<string>('tabs.notifications'),
    content: <BroadcastMessageForm />,
  },
  {
    key: 'users',
    label: t<string>('tabs.users'),
    content: <div>{/* Users management component will go here */}</div>,
  },
]

const Admin: FunctionComponent<Props> = () => {
  const { t } = useTranslation('admin')
  const location = useLocation()
  const history = useHistory()
  const { tab } = useParams<{ tab: string }>()

  const tabsConfig = getTabsConfig(t)

  const handleTabChange = useCallback(
    (key: string) => {
      history.push({ pathname: `/admin/${key}` })
    },
    [history]
  )

  useEffect(() => {
    if (!tab || tab.includes(':')) {
      return handleTabChange(tabsConfig[0].key)
    }
  }, [tab, handleTabChange, location.search, tabsConfig])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">{t<string>('title')}</h2>
      </div>

      <Card>
        <CardContent className="p-6">
          <Tabs value={tab || tabsConfig[0].key} onValueChange={handleTabChange}>
            <TabsList className="mb-4">
              {tabsConfig.map((tabItem) => (
                <TabsTrigger key={tabItem.key} value={tabItem.key}>
                  {tabItem.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {tabsConfig.map((tabItem) => (
              <TabsContent key={tabItem.key} value={tabItem.key}>
                {tabItem.content}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

export default Admin
