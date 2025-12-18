// Stub replacement for firestoreDateMapper without Firebase dependencies

export function firestoreDateMapper<T>(
  doc: any,
  mapper?: (data: T) => T
): T & { id: string; createdAt: Date; updatedAt: Date } {
  throw new Error("firestoreDateMapper is deprecated");
}

export function getDocumentConverter<T extends object>(
  mapper?: (data: T) => T
): any {
  return {
    toFirestore: (document: T) => document,
    fromFirestore: (document: any) => document,
  };
}
