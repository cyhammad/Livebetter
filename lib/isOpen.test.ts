import { isOpen } from "lib/isOpen";

describe("asdf", () => {
  it("should return true if the restaurant is open", () => {
    const restaurant = {
      MapPin: "indian9",
      OpenHours:
        '{"1": "17:00/21:00", "2": "17:00/21:30", "3": "17:00/21:30", "4": "17:00/21:30", "5": "17:00/21:30", "6": "17:00/22:30", "7": "17:00/22:30"}',
      Cuisine: "Indian",
      Latitude: "39.955709",
      Longitude: "-75.172584",
      OpenDays: "1,2,3,4,5,6,7",
      Address: "1939 Arch St Philadelphia PA 19103",
      Phone: "215-515-2511",
      Items:
        "Aloo Gobi, Amchuri Bhindi, Egg Plant Koora,  Gobi Manchurian, Indian Railway Peppers, Kadai Tofu,  Onion Pakora,  Podi Idly, Tadka Lentils",
      Image:
        "https://firebasestorage.googleapis.com/v0/b/new-practice-6441a.appspot.com/o/stock_Restaurant_Photos%2FIndian.jpg?alt=media&token=a601b172-ec98-4643-a3ff-6339592ef7cd",
      Restaurant: "THANAL INDIAN TAVERN",
      Website: "https://www.thanalphilly.com",
    };

    expect(isOpen(restaurant, new Date("2022-05-22T00:34:11.500Z"))).toBe(true);
  });

  it("should return false if the restaurant is closed today", () => {
    const restaurant = {
      MapPin: "martini_",
      OpenHours: '{"6": "19:00/22:00", "7": "19:00/22:00"}',
      Address: "1938 S Chadwick St Philadelphia PA 19145",
      Image:
        "https://firebasestorage.googleapis.com/v0/b/new-practice-6441a.appspot.com/o/stock_Restaurant_Photos%2FItalian.jpg?alt=media&token=0c938d5f-eae6-4ac4-ad11-7dc00839b36d",
      Phone: "215-798-0053",
      Latitude: "39.926531",
      Restaurant: "MISS RACHEL'S PANTRY",
      Items: "Upsacle, Date Night",
      Longitude: "-75.173765",
      Cuisine: "All Vegan, Caterer, Fine Dining",
      OpenDays: "6,7",
      Website: "https://www.missrachelspantry.com",
    };

    expect(isOpen(restaurant, new Date("2022-05-20T00:34:11.500Z"))).toBe(
      false
    );
  });

  it("should return false if the restaurant is open today, but closed now", () => {
    const restaurant = {
      MapPin: "martini_",
      OpenHours: '{"6": "19:00/22:00", "7": "19:00/22:00"}',
      Address: "1938 S Chadwick St Philadelphia PA 19145",
      Image:
        "https://firebasestorage.googleapis.com/v0/b/new-practice-6441a.appspot.com/o/stock_Restaurant_Photos%2FItalian.jpg?alt=media&token=0c938d5f-eae6-4ac4-ad11-7dc00839b36d",
      Phone: "215-798-0053",
      Latitude: "39.926531",
      Restaurant: "MISS RACHEL'S PANTRY",
      Items: "Upsacle, Date Night",
      Longitude: "-75.173765",
      Cuisine: "All Vegan, Caterer, Fine Dining",
      OpenDays: "6,7",
      Website: "https://www.missrachelspantry.com",
    };

    expect(isOpen(restaurant, new Date("2022-05-22T02:34:11.500Z"))).toBe(
      false
    );
  });
});

export {};
