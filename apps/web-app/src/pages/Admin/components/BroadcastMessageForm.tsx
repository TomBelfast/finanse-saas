import React, { lazy, Suspense, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useBroadcastMessage } from '~/hooks/useBroadcastMessage'
import data from '@emoji-mart/data'
import i18n from '@emoji-mart/data/i18n/pl.json'
import styles from './BroadcastMessageForm.module.css'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form'
import { Loader2 } from 'lucide-react'

const Picker = lazy(() => import('@emoji-mart/react'))

export type EmojiSkin = 1 | 2 | 3 | 4 | 5 | 6

export interface BaseEmoji {
  id: string
  name: string
  colons: string
  emoticons: string[]
  unified: string
  skin: EmojiSkin | null
  native: string
}

interface BroadcastMessageFormProps {
  onSuccess?: () => void
}

const DEFAULT_EMOJI = '📢'

const formSchema = z.object({
  title: z.string().min(1, 'Tytuł jest wymagany'),
  message: z.string().min(1, 'Wiadomość jest wymagana'),
  url: z.string().optional().refine((val) => !val || val === '' || z.string().url().safeParse(val).success, {
    message: 'Nieprawidłowy URL',
  }),
  emojiIcon: z.string().default(DEFAULT_EMOJI),
})

type FormValues = z.infer<typeof formSchema>

const BroadcastMessageForm: React.FC<BroadcastMessageFormProps> = ({ onSuccess }) => {
  const { t } = useTranslation(['admin', 'common'])
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const { sendBroadcastMessage, loading } = useBroadcastMessage()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      message: '',
      url: '',
      emojiIcon: DEFAULT_EMOJI,
    },
  })

  const handleSubmit = async (values: FormValues) => {
    try {
      await sendBroadcastMessage({
        ...values,
        url: values.url || undefined
      })
      form.reset()
      onSuccess?.()
    } catch (error) {
      // Error is handled in the hook
    }
  }

  const onEmojiSelect = (emoji: BaseEmoji) => {
    try {
      if (emoji && typeof emoji.native === 'string') {
        form.setValue('emojiIcon', emoji.native)
        setShowEmojiPicker(false)
      }
    } catch (error) {
      // Nothing to do
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('broadcast.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('broadcast.form.title')}</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            className="w-12 text-xl"
                          >
                            {form.watch('emojiIcon') || DEFAULT_EMOJI}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <div className={styles['emoji-picker-container']}>
                            <Suspense
                              fallback={
                                <div className="flex h-[435px] w-[352px] items-center justify-center">
                                  <Loader2 className="h-6 w-6 animate-spin" />
                                </div>
                              }
                            >
                              <Picker
                                data={data}
                                onEmojiSelect={onEmojiSelect}
                                theme="light"
                                i18n={i18n}
                                previewPosition="none"
                                skinTonePosition="none"
                                autoFocus
                              />
                            </Suspense>
                          </div>
                        </PopoverContent>
                      </Popover>
                      <Input
                        {...field}
                        placeholder={t('broadcast.form.title')}
                        className="flex-1"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('broadcast.form.message')}</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={4}
                      placeholder={t('broadcast.form.message')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('broadcast.form.url')}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={t('broadcast.form.url')} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('broadcast.form.submit')}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
              >
                {t('broadcast.form.reset')}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export default BroadcastMessageForm
