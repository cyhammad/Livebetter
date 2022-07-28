import { collection, getDocs } from "firebase/firestore";
import type { GetServerSideProps } from "next";

import { restaurantNameToUrlParam } from "lib/restaurantNameToUrlParam";
import { db } from "lib/server/db";
import type { Restaurant } from "types";

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const staticPages = [
    {
      priority: "1.0",
      url: `https://www.livebetterphl.com/`,
    },
    {
      priority: "0.8",
      url: `https://www.livebetterphl.com/restaurants`,
    },
  ];

  const restaurantDocs = await getDocs(
    collection(db, "Restaurants Philadelphia")
  );

  const restaurantPages = restaurantDocs.docs.map((doc) => {
    const restaurant = doc.data() as Restaurant;

    return {
      priority: "0.5",
      url: `https://www.livebetterphl.com/restaurant-detail/${restaurantNameToUrlParam(
        restaurant.Restaurant
      )}`,
    };
  });

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${[...staticPages, ...restaurantPages]
    .map(({ url, priority }) => {
      return `
        <url>
          <loc>${url}</loc>
          <changefreq>weekly</changefreq>
          <priority>${priority}</priority>
        </url>
      `;
    })
    .join("")}
</urlset>
  `;

  res.setHeader("Content-Type", "text/xml");
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
};

export default function Sitemap(): null {
  return null;
}
