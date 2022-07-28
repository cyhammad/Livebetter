/**
 * This Google Analytics setup was taken directly and nearly verbatim from
 * Next.js's examples. Please see that example before making changes.
 * @see https://github.com/vercel/next.js/tree/canary/examples/with-google-analytics
 */

// https://developers.google.com/analytics/devguides/collection/gtagjs/pages
export const reportPageView = (url: string) => {
  window.gtag("config", process.env.NEXT_PUBLIC_GA_ID, {
    page_path: url,
  });
};

interface EventOptions {
  action: string;
  category?: string;
  currency?: string;
  items?: Array<{ item_id: string }>;
  label?: string;
  transactionId?: string;
  value?: string;
}

// https://developers.google.com/analytics/devguides/collection/gtagjs/events
export const reportEvent = ({
  action,
  category,
  label,
  value,
  currency,
  items,
  transactionId,
}: EventOptions) => {
  window.gtag("event", action, {
    currency,
    event_category: category,
    event_label: label,
    items,
    transaction_id: transactionId,
    value,
  });
};
