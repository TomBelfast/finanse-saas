import React, { FC } from 'react'

interface IconTextProps {
  icon: FC<{ className?: string }>
  text: string
}

const IconText = ({ icon: Icon, text }: IconTextProps) => (
  <div className="flex items-center gap-2">
    <Icon className="h-4 w-4" />
    <span>{text}</span>
  </div>
)

export default IconText
