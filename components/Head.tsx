import NextHead from "next/head";

import type { HeadProps } from "types";

export const Head = ({ description, ogMetadata, titles }: HeadProps) => {
  const titlesWithAppName = [...titles, "Live Better PHL"];

  // These truncation lengths were taken from https://www.opengraph.xyz/
  const truncatedTitle = ogMetadata?.title?.substring(0, 60);
  const truncatedDescription = ogMetadata?.description?.substring(0, 155);

  return (
    <NextHead>
      <title>{titlesWithAppName.join(" - ")}</title>
      <meta name="description" content={description} />
      {/* <meta name="theme-color" content={vars.color.gray[0]} />x */}
      {ogMetadata && (
        <>
          <meta property="og:title" content={truncatedTitle} />
          <meta property="og:image" content={ogMetadata.image} />
          <meta property="og:type" content={ogMetadata.type} />
          <meta property="og:url" content={ogMetadata.url} />
          <meta property="og:locale" content="en_US" />
          <meta property="og:site_name" content="Live Better PHL" />
          {ogMetadata.audio && (
            <meta property="og:audio" content={ogMetadata.audio} />
          )}
          {ogMetadata.description && (
            <meta property="og:description" content={truncatedDescription} />
          )}
          {ogMetadata.video && (
            <meta property="og:video" content={ogMetadata.video} />
          )}
          <meta name="twitter:card" content="summary_large_image" />
          <meta property="twitter:domain" content="livebetterphl.com" />
          <meta property="twitter:url" content={ogMetadata.url} />
          <meta name="twitter:title" content={truncatedTitle} />
          <meta name="twitter:description" content={truncatedDescription} />
          <meta name="twitter:image" content={ogMetadata.image} />
        </>
      )}
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover"
      />
      <link
        href="/apple-touch-icon.png"
        rel="apple-touch-icon"
        sizes="180x180"
      />
      <link rel="icon" type="image/svg+xml" href="/favicon.ico" />
      {/* <link
        rel="icon"
        type="image/svg+xml"
        href="/favicon-dark.svg"
        media="(prefers-color-scheme: dark)"
      /> */}
      <link
        href="/favicon-32x32.png"
        rel="alternate icon"
        sizes="32x32"
        type="image/png"
      />
      <link
        href="/favicon-16x16.png"
        rel="alternate icon"
        sizes="16x16"
        type="image/png"
      />
      <link href="/site.webmanifest" rel="manifest" />
      {/* <link
        color={vars.color.gray[900]}
        href="/safari-pinned-tab.svg"
        rel="mask-icon"
      /> */}
    </NextHead>
  );
};
