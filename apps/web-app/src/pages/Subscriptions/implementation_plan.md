# Goal
Migrate `Subscriptions.tsx` and related components to shadcn/ui and remove Ant Design dependencies.

## Analyzed Components
- [Subscriptions.tsx](file:///k:/SSSAAAAAAS%20dzialajacy/apps/web-app/src/pages/Subscriptions/Subscriptions.tsx)

## Propsed Changes for `Subscriptions.tsx`
1.  **Replace Table**: Use `~/components/ui/table`.
2.  **Replace Dialog/Modal**: Use `~/components/ui/dialog` instead of Antd `Modal`.
3.  **Replace Form**: Use `react-hook-form` with `zod` and `~/components/ui/form` components (Input, Select, Textarea).
4.  **Replace Button**: Use `~/components/ui/button`.
5.  **Replace Cards & Statistics**: Use `~/components/ui/card` and custom statistic layout.
6.  **Replace Notifications**: Use `sonner` (`toast`) instead of Antd `message`.
7.  **Replace Popconfirm**: Use `AlertDialog` or `Popover`.
8.  **Replace Icons**: Use `lucide-react`.
9.  **Replace Upload**: Refactor `UploadField` usage if it relies on Antd, or ensure it works with the new setup. `UploadField` seems to be a custom component - need to check if it returns Ant Design components or uses them internally. Since `UploadField` is in `../../components/UploadField/UploadField`, it might need migration too.
    - *Action*: Check `k:/SSSAAAAAAS dzialajacy/apps/web-app/src/components/UploadField/UploadField.tsx`.

## Plan
1.  **Dependencies**: Ensure all shadcn components are present (added in previous steps).
2.  **UploadField Check**: Verify and migrate `UploadField` if necessary.
3.  **Refactor `Subscriptions.tsx`**:
    - Rewrite structure using Tailwind CSS.
    - Implement `useForm` for add/edit operations.
    - Implement filtered table.
    - Re-implement statistics cards.

## Steps
1.  [ ] Check `UploadField.tsx` for Ant Design usage.
2.  [ ] Migrate `UploadField.tsx` if needed.
3.  [ ] Migrate `Subscriptions.tsx`.
4.  [ ] Verify functionality.
