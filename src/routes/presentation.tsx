import { createFileRoute } from '@tanstack/react-router';
import PresentationSlides from '@/pages/PresentationSlides';

export const Route = createFileRoute('/presentation')({
  component: PresentationSlides,
  head: () => ({
    title: 'عرض مجلس الإدارة | LIFECO Digital',
    meta: [
      {
        name: 'description',
        content: 'عرض تقديمي احترافي لمجلس إدارة الشركة الليبية للأسمدة حول التحول الرقمي ونظام LIFECO 2026.',
      },
    ],
  }),
});
