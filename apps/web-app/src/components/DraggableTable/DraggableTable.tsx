import React, { useMemo } from 'react'
import { GripVertical } from 'lucide-react'
import { DndContext, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { cn } from '~/lib/utils'

export type CustomizeComponent = React.ComponentType<any>

interface DraggableTableProps<T extends { id: string }> {
  dataSource: T[]
  columns: any[] // Uproszczone, w praktyce można lepiej otypować
  onUpdateListOrder: (itemId: string, destination: number, source: number) => void
  children?: React.ReactElement[]
  wrapper?: CustomizeComponent
  dndDisabled?: boolean
  rowKey?: string
}

interface RowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  'data-row-key': string
  children: React.ReactNode
}

const Row = ({ children, className, ...props }: RowProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: props['data-row-key'],
  })

  // Check if this is a header row or placeholder
  if (!props['data-row-key']) {
    return <TableRow className={className} {...props}>{children}</TableRow>
  }

  const style: React.CSSProperties = {
    ...props.style,
    transform: CSS.Transform.toString(transform && { ...transform, scaleY: 1 }),
    transition,
    zIndex: isDragging ? 9999 : 'auto',
    position: isDragging ? 'relative' : 'static',
  }

  // Find the sort handle cell and inject listeners
  const childrenWithHandle = React.Children.map(children, (child) => {
    if (React.isValidElement(child) && (child as any).key === 'sort') {
      return React.cloneElement(child, {
        children: (
          <div
            ref={setActivatorNodeRef}
            className="cursor-move touch-none flex items-center justify-center text-muted-foreground hover:text-foreground"
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </div>
        ),
      } as any)
    }
    return child
  })

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={cn(className, isDragging && "bg-muted/50")}
      {...attributes}
      {...props}
    >
      {childrenWithHandle}
    </TableRow>
  )
}

function DraggableTable<T extends { id: string }>({
  dataSource,
  columns,
  onUpdateListOrder,
  children,
  wrapper,
  dndDisabled,
  ...props
}: DraggableTableProps<T>) {
  const items = useMemo(() => dataSource.map((item) => item.id), [dataSource])
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 4,
      },
    })
  )

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (over && active.id !== over?.id) {
      const activeIndex = items.findIndex((id) => id === active.id)
      const overIndex = items.findIndex((id) => id === over?.id)
      onUpdateListOrder(active.id as string, overIndex, activeIndex)
    }
  }

  return (
    <DndContext sensors={sensors} modifiers={[restrictToVerticalAxis]} onDragEnd={onDragEnd}>
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((col: any) => (
                  <TableHead key={col.key || col.dataIndex} className={col.className}>
                    {col.title}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {dataSource.map((record) => (
                <Row key={record.id} data-row-key={record.id}>
                  {columns.map((col: any) => (
                    <TableCell key={col.key || col.dataIndex} className={col.className}>
                      {col.render ? col.render((record as any)[col.dataIndex], record) : (record as any)[col.dataIndex]}
                    </TableCell>
                  ))}
                </Row>
              ))}
            </TableBody>
          </Table>
        </div>
      </SortableContext>
    </DndContext>
  )
}

export default DraggableTable
