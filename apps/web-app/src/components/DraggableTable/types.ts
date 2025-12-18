import React from 'react';

export interface TableColumn<T = unknown> {
  key?: string;
  dataIndex?: string;
  title?: React.ReactNode;
  className?: string;
  render?: (value: unknown, record: T) => React.ReactNode;
}

export type CustomizeComponent = React.ComponentType<React.HTMLAttributes<HTMLElement>>;

