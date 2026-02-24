const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const { faker } = require("@faker-js/faker");

const prisma = new PrismaClient();

const SALT_ROUNDS = 12;

const INDIAN_COLLEGES = [
  "IIT Delhi",
  "IIT Bombay",
  "IIT Madras",
  "IIT Kanpur",
  "IIT Kharagpur",
  "BITS Pilani",
  "BITS Goa",
  "BITS Hyderabad",
  "VIT Vellore",
  "VIT Chennai",
  "SRM University",
  "Delhi University",
  "JNU",
  "Anna University",
  "IISc Bangalore",
  "IIM Ahmedabad",
  "NIT Trichy",
  "NIT Surathkal",
  "BMS College",
  "PES University",
  "Manipal University",
  "Amity University",
  "LPU",
  "Chandigarh University",
  "Symbiosis",
  "SPJain",
];

const CITY_PAIRS = [
  ["Delhi", "Jaipur"],
  ["Delhi", "Chandigarh"],
  ["Delhi", "Manali"],
  ["Mumbai", "Pune"],
  ["Mumbai", "Goa"],
  ["Bangalore", "Chennai"],
  ["Bangalore", "Hyderabad"],
  ["Bangalore", "Mysore"],
  ["Chennai", "Pondicherry"],
  ["Chennai", "Bangalore"],
  ["Hyderabad", "Bangalore"],
  ["Hyderabad", "Vizag"],
  ["Pune", "Mumbai"],
  ["Pune", "Goa"],
  ["Kolkata", "Bhubaneswar"],
  ["Jaipur", "Delhi"],
  ["Chandigarh", "Manali"],
  ["Ahmedabad", "Mumbai"],
  ["Kochi", "Chennai"],
  ["Indore", "Bhopal"],
];

const VEHICLES = [
  "Swift Dzire",
  "Honda City",
  "Hyundai Creta",
  "Maruti Ertiga",
  "Innova",
  "XUV500",
  "Tata Nexon",
  "Baleno",
  "i20",
];

const RIDE_NOTES = [
  "AC cab",
  "Non-smoking",
  "Luggage space available",
  "Music lovers welcome",
  "Early morning start",
  "Flexible pickup",
  "Share petrol cost",
  null,
];

const REVIEW_COMMENTS = [
  "Smooth ride, great conversation!",
  "Punctual and friendly.",
  "Highly recommend!",
  "Awesome trip, will ride again.",
  "Very professional driver.",
  "Comfortable journey.",
  "Great vibes throughout.",
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickMany(arr, n) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function main() {
  console.log("[seed] Adding data (existing data preserved)...");

  const passwordHash = await bcrypt.hash("password123", SALT_ROUNDS);

  // ─── Core test users (ensure they exist) ───────────────────────────────────
  const testUsers = [
    { email: "alice@college.edu", firstName: "Alice", lastName: "Sharma", college: "IIT Delhi", gender: "FEMALE", bio: "CS final year, love road trips" },
    { email: "bob@college.edu", firstName: "Bob", lastName: "Kumar", college: "BITS Pilani", gender: "MALE", bio: "Frequent traveller between Delhi and Jaipur" },
    { email: "carol@college.edu", firstName: "Carol", lastName: "Singh", college: "DU", gender: "FEMALE" },
    { email: "dave@college.edu", firstName: "Dave", lastName: "Patel", college: "IIT Bombay", gender: "MALE" },
  ];
  for (const u of testUsers) {
    await prisma.user.upsert({
      where: { email: u.email },
      create: {
        email: u.email,
        passwordHash,
        firstName: u.firstName,
        lastName: u.lastName,
        phone: "+919876543210",
        gender: u.gender,
        college: u.college,
        collegeVerified: true,
        emailVerified: true,
        bio: u.bio || null,
      },
      update: {},
    });
  }

  // ─── Users (80 new users via faker) ────────────────────────────────────────
  console.log("[seed] creating users...");
  const existingEmails = new Set(
    (await prisma.user.findMany({ select: { email: true } })).map((u) => u.email)
  );

  const newUsers = [];
  const NUM_USERS = 80;
  for (let i = 0; i < NUM_USERS; i++) {
    let email;
    do {
      email = `s${Date.now().toString(36)}${i}${faker.string.alphanumeric(4)}@college.edu`;
    } while (existingEmails.has(email));
    existingEmails.add(email);

    const gender = pick(["MALE", "FEMALE"]);
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const college = pick(INDIAN_COLLEGES);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        phone: faker.phone.number("+91##########"),
        gender,
        college,
        collegeVerified: faker.datatype.boolean(0.7),
        emailVerified: true,
        bio: faker.datatype.boolean(0.5) ? faker.lorem.sentence(8) : null,
      },
    });
    newUsers.push(user);
  }

  const allUsers = await prisma.user.findMany();
  console.log(`[seed] total users: ${allUsers.length}`);

  // ─── Rides (150 new rides) ───────────────────────────────────────────────
  console.log("[seed] creating rides...");
  const now = new Date();
  const pastStart = new Date(now);
  pastStart.setDate(pastStart.getDate() - 60);
  const futureEnd = new Date(now);
  futureEnd.setDate(futureEnd.getDate() + 90);

  const rideStatuses = ["ACTIVE", "ACTIVE", "ACTIVE", "FULL", "DEPARTED", "COMPLETED", "CANCELLED"];
  const NUM_RIDES = 150;

  for (let i = 0; i < NUM_RIDES; i++) {
    const creator = pick(allUsers);
    const [fromCity, toCity] = pick(CITY_PAIRS);
    const departureTime = randomDate(pastStart, futureEnd);
    const durationHrs = 2 + Math.floor(Math.random() * 10);
    const estimatedArrival = new Date(departureTime.getTime() + durationHrs * 60 * 60 * 1000);
    const totalSeats = 2 + Math.floor(Math.random() * 3);
    const status = pick(rideStatuses);

    let availableSeats = totalSeats;
    if (status === "FULL") availableSeats = 0;
    else if (status === "DEPARTED" || status === "COMPLETED") {
      availableSeats = Math.floor(Math.random() * (totalSeats + 1));
    } else if (status === "ACTIVE") {
      availableSeats = Math.floor(Math.random() * totalSeats) + 1;
    }

    const pricePerSeat = 100 + Math.floor(Math.random() * 800);
    const vehicle = faker.datatype.boolean(0.8) ? pick(VEHICLES) : null;
    const vehicleNumber = vehicle
      ? `${faker.string.alpha({ length: 2, casing: "upper" })}${faker.string.numeric(2)}${faker.string.alpha({ length: 2, casing: "upper" })}${faker.string.numeric(4)}`
      : null;

    await prisma.ride.create({
      data: {
        creatorId: creator.id,
        fromCity,
        fromAddress: faker.location.streetAddress(),
        toCity,
        toAddress: faker.location.streetAddress(),
        departureTime,
        estimatedArrival,
        totalSeats,
        availableSeats,
        pricePerSeat,
        vehicle,
        vehicleNumber,
        notes: pick(RIDE_NOTES),
        status,
      },
    });
  }

  const allRides = await prisma.ride.findMany({ include: { creator: true } });
  console.log(`[seed] total rides: ${allRides.length}`);

  // ─── Bookings (250 new bookings) ───────────────────────────────────────────
  console.log("[seed] creating bookings...");
  const rideMap = new Map();
  for (const r of allRides) {
    if (!rideMap.has(r.id)) rideMap.set(r.id, []);
    rideMap.get(r.id).push(r);
  }

  const bookingStatuses = ["PENDING", "CONFIRMED", "CONFIRMED", "REJECTED", "CANCELLED", "COMPLETED"];
  const NUM_BOOKINGS = 250;
  let bookingsCreated = 0;

  for (let i = 0; i < NUM_BOOKINGS; i++) {
    const ride = pick(allRides);
    const passenger = pick(allUsers);
    if (passenger.id === ride.creatorId) continue; // can't book own ride

    const status = pick(bookingStatuses);
    const seatsBooked = Math.min(1 + Math.floor(Math.random() * 2), ride.availableSeats || 1);
    if (seatsBooked < 1) continue;

    try {
      await prisma.booking.create({
        data: {
          rideId: ride.id,
          passengerId: passenger.id,
          seatsBooked,
          status,
          message: faker.datatype.boolean(0.3) ? faker.lorem.sentence() : null,
        },
      });
      bookingsCreated++;
    } catch {
      // unique constraint (rideId, passengerId) - skip
    }
  }
  console.log(`[seed] bookings created: ${bookingsCreated}`);

  // ─── Reviews (passenger → driver for completed rides) ───────────────────────
  console.log("[seed] creating reviews...");
  const completedRides = allRides.filter(
    (r) => r.status === "COMPLETED" || r.status === "DEPARTED"
  );
  const rideBookings = await prisma.booking.findMany({
    where: {
      rideId: { in: completedRides.map((r) => r.id) },
      status: { in: ["CONFIRMED", "COMPLETED"] },
    },
    include: { ride: true },
  });

  const reviewed = new Set();
  let reviewsCreated = 0;
  for (const b of rideBookings) {
    const authorId = b.passengerId;
    const targetId = b.ride.creatorId;
    if (authorId === targetId) continue;
    if (reviewed.has(`${authorId}-${b.rideId}`)) continue;
    try {
      await prisma.review.create({
        data: {
          authorId,
          targetId,
          rideId: b.rideId,
          rating: 3 + Math.floor(Math.random() * 3),
          comment: pick(REVIEW_COMMENTS),
        },
      });
      reviewed.add(`${authorId}-${b.rideId}`);
      reviewsCreated++;
    } catch {
      // unique (authorId, rideId)
    }
  }
  console.log(`[seed] reviews created: ${reviewsCreated}`);

  // ─── Notifications (200 new) ───────────────────────────────────────────────
  console.log("[seed] creating notifications...");
  const notifTypes = [
    "BOOKING_REQUEST",
    "BOOKING_CONFIRMED",
    "BOOKING_REJECTED",
    "RIDE_REMINDER",
    "REVIEW_RECEIVED",
    "SYSTEM",
  ];
  const notifTitles = {
    BOOKING_REQUEST: "New booking request",
    BOOKING_CONFIRMED: "Booking confirmed!",
    BOOKING_REJECTED: "Booking declined",
    RIDE_REMINDER: "Ride reminder",
    REVIEW_RECEIVED: "You received a review",
    SYSTEM: "Update from drift",
  };
  const notifBodies = {
    BOOKING_REQUEST: "Someone requested a seat on your ride.",
    BOOKING_CONFIRMED: "Your booking was confirmed. Have a great trip!",
    BOOKING_REJECTED: "Your booking request was declined.",
    RIDE_REMINDER: "Your ride departs soon. Don't forget!",
    REVIEW_RECEIVED: "A rider left you a review. Check it out.",
    SYSTEM: "New features are live. Explore the app.",
  };

  const notificationsData = [];
  for (let i = 0; i < 200; i++) {
    const user = pick(allUsers);
    const type = pick(notifTypes);
    notificationsData.push({
      userId: user.id,
      type,
      title: notifTitles[type],
      body: notifBodies[type],
      read: faker.datatype.boolean(0.6),
    });
  }
  await prisma.notification.createMany({ data: notificationsData });

  const totalUsers = await prisma.user.count();
  const totalRides = await prisma.ride.count();
  const totalBookings = await prisma.booking.count();
  const totalReviews = await prisma.review.count();
  const totalNotifs = await prisma.notification.count();

  console.log("[seed] done! Database now has:");
  console.log(`  - ${totalUsers} users`);
  console.log(`  - ${totalRides} rides`);
  console.log(`  - ${totalBookings} bookings`);
  console.log(`  - ${totalReviews} reviews`);
  console.log(`  - ${totalNotifs} notifications`);
  console.log("");
  console.log("New users have password: password123");
}

main()
  .catch((e) => {
    console.error("[seed] error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
