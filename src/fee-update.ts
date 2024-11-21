import { getMongoConnection } from "./bootstrap";
import { Polygon } from "./blockchain/network/Polygon";
import { FeeScraper } from "./util/FeeScraper";

async function updateFees() {
  await getMongoConnection();

  // update polygon fees
  const polygonFeeScraper = new FeeScraper(new Polygon());
  await polygonFeeScraper.scrapeFees();
}

updateFees();