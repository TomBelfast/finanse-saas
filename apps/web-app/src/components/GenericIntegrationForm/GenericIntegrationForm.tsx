import React, { useEffect, useMemo } from 'react'
import { useForm, UseFormReturn, FieldPath } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '~/components/ui/form'
import { Input } from '~/components/ui/input'
import { Switch } from '~/components/ui/switch'
import { Button } from '~/components/ui/button'

type FieldProps = {
  hidden?: boolean
  label?: string
  tooltip?: string
  placeholder?: string
  required?: boolean
  rules?: Array<{ message?: string; pattern?: RegExp; validator?: (value: unknown) => boolean }>
  default?: string | boolean
  sensitive?: boolean
  autofocus?: boolean
  type: 'text' | 'number' | 'boolean'
}

export type Fields<T> = {
  [key in Extract<keyof T, string>]: FieldProps | null
}

interface OwnProps<T extends object> {
  model?: Partial<T> | null
  // We keep this prop for compatibility but now we expect react-hook-form instance if passed externally, 
  // or we create one internally. But standardizing on internal creation is safer for migration.
  // Actually, let's allow passing defaultValues via model and handle submission.
  // formController?: FormInstance<T>; // REMOVED standard antd controller
  onSubmit: (formData: T) => void
  fields: Fields<T>
}

type Props<T extends object> = OwnProps<T>

function GenericIntegrationForm<T extends object>({
  fields,
  model,
  onSubmit,
}: Props<T>) {
  const { t } = useTranslation(['dashboard', 'common'])

  const providedFields = Object.entries(fields).filter(([_, field]) => !!field) as [string, FieldProps][]

  const defaultValues = useMemo(() => {
    return providedFields.reduce((acc, [name, field]) => {
      if (field.default !== undefined) {
        (acc as Record<string, unknown>)[name] = field.default
      }
      return acc
    }, {} as Partial<T>)
  }, [providedFields])

  const form = useForm<T>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    defaultValues: { ...defaultValues, ...model } as any,
  })

  // Update form when model changes
  useEffect(() => {
    if (model) {
      form.reset({ ...defaultValues, ...model } as unknown as T)
    }
  }, [model, form, defaultValues])

  const handleSubmit = (data: T) => {
    onSubmit(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit as never)} className="space-y-6">
        {providedFields.map(([name, field]) => {
          if (field.hidden) return null

          return (
            <FormField
              key={name}
              control={form.control}
              name={name as FieldPath<T>}
              rules={{
                required: field.required ? t<string>('common:validationErrors.fieldIsRequired') : false,
              }}
              render={({ field: formField }) => (
                <FormItem className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-base">
                      {field.label}
                      {field.required && <span className="text-destructive ml-1">*</span>}
                    </FormLabel>
                    {field.type === 'boolean' && (
                      <FormControl>
                        <Switch
                          checked={formField.value as boolean}
                          onChange={(e) => formField.onChange(e.target.checked)}
                        />
                      </FormControl>
                    )}
                  </div>

                  {field.tooltip && <FormDescription>{field.tooltip}</FormDescription>}

                  {field.type !== 'boolean' && (
                    <FormControl>
                      <Input
                        type={field.type === 'number' ? 'number' : (field.sensitive ? 'password' : 'text')}
                        placeholder={field.placeholder}
                        autoFocus={field.autofocus}
                        {...formField}
                        value={formField.value?.toString() || ''}
                        onChange={(e) => {
                          const val = field.type === 'number' ? parseFloat(e.target.value) : e.target.value
                          formField.onChange(val)
                        }}
                      />
                    </FormControl>
                  )}

                  <FormMessage />
                </FormItem>
              )}
            />
          )
        })}

        <div className="flex justify-end">
          <Button type="submit">
            {t('common:button.save')}
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default GenericIntegrationForm
