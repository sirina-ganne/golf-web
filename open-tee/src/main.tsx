import React, { FormEvent, useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  Crosshair,
  DollarSign,
  Filter,
  Flag,
  LocateFixed,
  LockKeyhole,
  MapPin,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Star,
  Users,
} from "lucide-react";
import "./styles.css";

type Access = "Public" | "Semi-private" | "Private member";
type SortBy = "distance" | "price";

type Coordinates = {
  lat: number;
  lng: number;
};

type TeeTime = {
  id: number;
  course: string;
  city: string;
  distance: number;
  access: Access;
  time: string;
  date: string;
  price: number;
  spots: number;
  rating: number;
  holes: 9 | 18;
  cartIncluded: boolean;
  pace: string;
  image: string;
  amenities: string[];
  lat: number;
  lng: number;
};

type SearchResult = TeeTime & {
  currentDistance: number;
};

const defaultOrigin: Coordinates = {
  lat: 40.81,
  lng: -73.64,
};

const knownLocations: Record<string, Coordinates> = {
  "new york": { lat: 40.7128, lng: -74.006 },
  nyc: { lat: 40.7128, lng: -74.006 },
  manhattan: { lat: 40.7831, lng: -73.9712 },
  queens: { lat: 40.7282, lng: -73.7949 },
  brooklyn: { lat: 40.6782, lng: -73.9442 },
  "long island": { lat: 40.7891, lng: -73.135 },
  "port washington": { lat: 40.8257, lng: -73.6982 },
  "glen head": { lat: 40.8354, lng: -73.6237 },
  farmingdale: { lat: 40.7326, lng: -73.4454 },
  "east meadow": { lat: 40.7139, lng: -73.559 },
  bronx: { lat: 40.8448, lng: -73.8648 },
  minneapolis: { lat: 44.9778, lng: -93.265 },
  "minneapolis, mn": { lat: 44.9778, lng: -93.265 },
  "st paul": { lat: 44.9537, lng: -93.09 },
  "saint paul": { lat: 44.9537, lng: -93.09 },
  edina: { lat: 44.8897, lng: -93.35 },
  bloomington: { lat: 44.8408, lng: -93.2983 },
  holmdel: { lat: 40.3451, lng: -74.184 },
  "holmdel, nj": { lat: 40.3451, lng: -74.184 },
  "07733": { lat: 40.3451, lng: -74.184 },
  "colts neck": { lat: 40.2876, lng: -74.1724 },
  freehold: { lat: 40.2601, lng: -74.2738 },
  wall: { lat: 40.1704, lng: -74.0946 },
};

const teeTimes: TeeTime[] = [
  {
    id: 1,
    course: "Harbor Links Golf Club",
    city: "Port Washington, NY",
    distance: 4.2,
    access: "Public",
    time: "7:18 AM",
    date: "Today",
    price: 58,
    spots: 4,
    rating: 4.6,
    holes: 18,
    cartIncluded: true,
    pace: "4h 07m",
    image:
      "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=1200&q=80",
    amenities: ["Driving range", "Waterfront", "GPS carts"],
    lat: 40.83,
    lng: -73.69,
  },
  {
    id: 2,
    course: "Bethpage Green Course",
    city: "Farmingdale, NY",
    distance: 13.8,
    access: "Public",
    time: "8:42 AM",
    date: "Today",
    price: 46,
    spots: 2,
    rating: 4.4,
    holes: 18,
    cartIncluded: false,
    pace: "4h 22m",
    image:
      "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&w=1200&q=80",
    amenities: ["Walking friendly", "Practice green", "State park"],
    lat: 40.74,
    lng: -73.46,
  },
  {
    id: 3,
    course: "Pelham Bay & Split Rock",
    city: "Bronx, NY",
    distance: 16.4,
    access: "Public",
    time: "10:06 AM",
    date: "Tomorrow",
    price: 72,
    spots: 3,
    rating: 4.1,
    holes: 18,
    cartIncluded: true,
    pace: "4h 15m",
    image:
      "https://images.unsplash.com/photo-1592919505780-303950717480?auto=format&fit=crop&w=1200&q=80",
    amenities: ["Two courses", "Clubhouse", "Lessons"],
    lat: 40.87,
    lng: -73.81,
  },
  {
    id: 4,
    course: "North Shore Country Club",
    city: "Glen Head, NY",
    distance: 7.6,
    access: "Private member",
    time: "11:12 AM",
    date: "Today",
    price: 92,
    spots: 1,
    rating: 4.8,
    holes: 18,
    cartIncluded: true,
    pace: "3h 54m",
    image:
      "https://images.unsplash.com/photo-1577906923414-6d2d79b1b724?auto=format&fit=crop&w=1200&q=80",
    amenities: ["Member verified", "Caddie available", "Locker room"],
    lat: 40.84,
    lng: -73.62,
  },
  {
    id: 5,
    course: "Eisenhower Park Red",
    city: "East Meadow, NY",
    distance: 9.4,
    access: "Public",
    time: "1:28 PM",
    date: "Saturday",
    price: 64,
    spots: 4,
    rating: 4.5,
    holes: 18,
    cartIncluded: false,
    pace: "4h 19m",
    image:
      "https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&w=1200&q=80",
    amenities: ["Championship layout", "Resident rates", "Range"],
    lat: 40.73,
    lng: -73.57,
  },
  {
    id: 6,
    course: "Sands Point Golf Club",
    city: "Sands Point, NY",
    distance: 5.9,
    access: "Semi-private",
    time: "3:04 PM",
    date: "Tomorrow",
    price: 88,
    spots: 2,
    rating: 4.7,
    holes: 18,
    cartIncluded: true,
    pace: "4h 02m",
    image:
      "https://images.unsplash.com/photo-1518602164578-cd0074062767?auto=format&fit=crop&w=1200&q=80",
    amenities: ["Guest windows", "Short game area", "Dining"],
    lat: 40.85,
    lng: -73.71,
  },
  {
    id: 7,
    course: "Hiawatha Golf Club",
    city: "Minneapolis, MN",
    distance: 0,
    access: "Public",
    time: "7:30 AM",
    date: "Today",
    price: 42,
    spots: 4,
    rating: 4.2,
    holes: 18,
    cartIncluded: false,
    pace: "4h 10m",
    image:
      "https://images.unsplash.com/photo-1518602164578-cd0074062767?auto=format&fit=crop&w=1200&q=80",
    amenities: ["City course", "Practice green", "Lake nearby"],
    lat: 44.9153,
    lng: -93.2348,
  },
  {
    id: 8,
    course: "Theodore Wirth Golf Club",
    city: "Minneapolis, MN",
    distance: 0,
    access: "Public",
    time: "9:00 AM",
    date: "Today",
    price: 49,
    spots: 2,
    rating: 4.3,
    holes: 18,
    cartIncluded: true,
    pace: "4h 18m",
    image:
      "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=1200&q=80",
    amenities: ["Parkland layout", "Range", "Nordic chalet"],
    lat: 44.9994,
    lng: -93.3239,
  },
  {
    id: 9,
    course: "Columbia Golf Club",
    city: "Minneapolis, MN",
    distance: 0,
    access: "Public",
    time: "11:30 AM",
    date: "Tomorrow",
    price: 44,
    spots: 3,
    rating: 4.0,
    holes: 18,
    cartIncluded: false,
    pace: "4h 05m",
    image:
      "https://images.unsplash.com/photo-1592919505780-303950717480?auto=format&fit=crop&w=1200&q=80",
    amenities: ["Classic muni", "Beginner friendly", "Clubhouse"],
    lat: 45.0372,
    lng: -93.2554,
  },
  {
    id: 10,
    course: "Braemar Golf Course",
    city: "Edina, MN",
    distance: 0,
    access: "Public",
    time: "1:00 PM",
    date: "Saturday",
    price: 68,
    spots: 4,
    rating: 4.6,
    holes: 18,
    cartIncluded: true,
    pace: "4h 12m",
    image:
      "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&w=1200&q=80",
    amenities: ["Renovated greens", "Toptracer range", "Short course"],
    lat: 44.8778,
    lng: -93.3857,
  },
  {
    id: 11,
    course: "Gross National Golf Club",
    city: "Minneapolis, MN",
    distance: 0,
    access: "Public",
    time: "3:30 PM",
    date: "Tomorrow",
    price: 47,
    spots: 2,
    rating: 4.1,
    holes: 18,
    cartIncluded: true,
    pace: "4h 16m",
    image:
      "https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&w=1200&q=80",
    amenities: ["Tree-lined", "Affordable", "Putting green"],
    lat: 45.0125,
    lng: -93.2191,
  },
  {
    id: 12,
    course: "Meadowbrook Golf Club",
    city: "Hopkins, MN",
    distance: 0,
    access: "Public",
    time: "5:00 PM",
    date: "Saturday",
    price: 55,
    spots: 3,
    rating: 4.4,
    holes: 18,
    cartIncluded: true,
    pace: "4h 08m",
    image:
      "https://images.unsplash.com/photo-1577906923414-6d2d79b1b724?auto=format&fit=crop&w=1200&q=80",
    amenities: ["Creekside holes", "Twilight rates", "Patio"],
    lat: 44.9381,
    lng: -93.4033,
  },
  {
    id: 13,
    course: "Highland National Golf Course",
    city: "St. Paul, MN",
    distance: 0,
    access: "Public",
    time: "6:30 AM",
    date: "Today",
    price: 52,
    spots: 4,
    rating: 4.5,
    holes: 18,
    cartIncluded: false,
    pace: "4h 14m",
    image:
      "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=1200&q=80",
    amenities: ["Urban layout", "Practice area", "Walking friendly"],
    lat: 44.9075,
    lng: -93.1789,
  },
  {
    id: 14,
    course: "Como Golf Course",
    city: "St. Paul, MN",
    distance: 0,
    access: "Public",
    time: "8:00 AM",
    date: "Tomorrow",
    price: 39,
    spots: 3,
    rating: 3.9,
    holes: 18,
    cartIncluded: false,
    pace: "4h 00m",
    image:
      "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&w=1200&q=80",
    amenities: ["Value round", "Classic park course", "Beginner friendly"],
    lat: 44.9827,
    lng: -93.1491,
  },
  {
    id: 15,
    course: "Phalen Golf Course",
    city: "St. Paul, MN",
    distance: 0,
    access: "Public",
    time: "10:30 AM",
    date: "Saturday",
    price: 45,
    spots: 4,
    rating: 4.0,
    holes: 18,
    cartIncluded: true,
    pace: "4h 11m",
    image:
      "https://images.unsplash.com/photo-1592919505780-303950717480?auto=format&fit=crop&w=1200&q=80",
    amenities: ["Lake views", "Practice green", "Affordable"],
    lat: 44.9886,
    lng: -93.0639,
  },
  {
    id: 16,
    course: "Brookview Golf Course",
    city: "Golden Valley, MN",
    distance: 0,
    access: "Public",
    time: "12:00 PM",
    date: "Today",
    price: 61,
    spots: 2,
    rating: 4.4,
    holes: 18,
    cartIncluded: true,
    pace: "4h 07m",
    image:
      "https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&w=1200&q=80",
    amenities: ["Modern clubhouse", "Lawn bowling", "Range"],
    lat: 44.9904,
    lng: -93.3688,
  },
  {
    id: 17,
    course: "Les Bolstad Golf Course",
    city: "Falcon Heights, MN",
    distance: 0,
    access: "Public",
    time: "2:00 PM",
    date: "Tomorrow",
    price: 43,
    spots: 4,
    rating: 4.1,
    holes: 18,
    cartIncluded: false,
    pace: "4h 03m",
    image:
      "https://images.unsplash.com/photo-1577906923414-6d2d79b1b724?auto=format&fit=crop&w=1200&q=80",
    amenities: ["University course", "Walkable", "Tree-lined"],
    lat: 44.9889,
    lng: -93.1782,
  },
  {
    id: 18,
    course: "Baker National Golf Course",
    city: "Medina, MN",
    distance: 0,
    access: "Public",
    time: "7:00 AM",
    date: "Saturday",
    price: 79,
    spots: 3,
    rating: 4.7,
    holes: 18,
    cartIncluded: true,
    pace: "4h 21m",
    image:
      "https://images.unsplash.com/photo-1518602164578-cd0074062767?auto=format&fit=crop&w=1200&q=80",
    amenities: ["Regional park", "Championship layout", "Practice facility"],
    lat: 45.0238,
    lng: -93.6193,
  },
  {
    id: 19,
    course: "Edinburgh USA",
    city: "Brooklyn Park, MN",
    distance: 0,
    access: "Public",
    time: "8:30 AM",
    date: "Today",
    price: 84,
    spots: 2,
    rating: 4.6,
    holes: 18,
    cartIncluded: true,
    pace: "4h 19m",
    image:
      "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=1200&q=80",
    amenities: ["Tournament pedigree", "Island green", "Clubhouse"],
    lat: 45.1172,
    lng: -93.3468,
  },
  {
    id: 20,
    course: "Bunker Hills Golf Club",
    city: "Coon Rapids, MN",
    distance: 0,
    access: "Public",
    time: "11:00 AM",
    date: "Tomorrow",
    price: 74,
    spots: 4,
    rating: 4.5,
    holes: 18,
    cartIncluded: true,
    pace: "4h 17m",
    image:
      "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&w=1200&q=80",
    amenities: ["27 holes", "Event venue", "Range"],
    lat: 45.1746,
    lng: -93.2995,
  },
  {
    id: 21,
    course: "Chaska Town Course",
    city: "Chaska, MN",
    distance: 0,
    access: "Public",
    time: "1:30 PM",
    date: "Saturday",
    price: 92,
    spots: 2,
    rating: 4.8,
    holes: 18,
    cartIncluded: true,
    pace: "4h 20m",
    image:
      "https://images.unsplash.com/photo-1592919505780-303950717480?auto=format&fit=crop&w=1200&q=80",
    amenities: ["Championship feel", "Bentgrass greens", "Premium public"],
    lat: 44.8118,
    lng: -93.6202,
  },
  {
    id: 22,
    course: "Stonebrooke Golf Club",
    city: "Shakopee, MN",
    distance: 0,
    access: "Semi-private",
    time: "3:00 PM",
    date: "Today",
    price: 86,
    spots: 3,
    rating: 4.6,
    holes: 18,
    cartIncluded: true,
    pace: "4h 13m",
    image:
      "https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&w=1200&q=80",
    amenities: ["Ferry hole", "Water features", "Dining"],
    lat: 44.7856,
    lng: -93.4458,
  },
  {
    id: 23,
    course: "The Wilds Golf Club",
    city: "Prior Lake, MN",
    distance: 0,
    access: "Public",
    time: "4:30 PM",
    date: "Tomorrow",
    price: 99,
    spots: 2,
    rating: 4.7,
    holes: 18,
    cartIncluded: true,
    pace: "4h 24m",
    image:
      "https://images.unsplash.com/photo-1577906923414-6d2d79b1b724?auto=format&fit=crop&w=1200&q=80",
    amenities: ["Scenic bluffs", "Target golf", "Premium public"],
    lat: 44.7266,
    lng: -93.4172,
  },
  {
    id: 24,
    course: "Dwan Golf Club",
    city: "Bloomington, MN",
    distance: 0,
    access: "Public",
    time: "5:30 PM",
    date: "Saturday",
    price: 41,
    spots: 4,
    rating: 4.0,
    holes: 18,
    cartIncluded: false,
    pace: "3h 58m",
    image:
      "https://images.unsplash.com/photo-1518602164578-cd0074062767?auto=format&fit=crop&w=1200&q=80",
    amenities: ["Fast round", "Value pricing", "League play"],
    lat: 44.8285,
    lng: -93.3042,
  },
  {
    id: 25,
    course: "Hominy Hill Golf Course",
    city: "Colts Neck, NJ",
    distance: 0,
    access: "Public",
    time: "7:00 AM",
    date: "Today",
    price: 82,
    spots: 4,
    rating: 4.8,
    holes: 18,
    cartIncluded: true,
    pace: "4h 18m",
    image:
      "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=1200&q=80",
    amenities: ["County course", "Highly rated", "Practice area"],
    lat: 40.3017,
    lng: -74.1839,
  },
  {
    id: 26,
    course: "Pebble Creek Golf Club",
    city: "Colts Neck, NJ",
    distance: 0,
    access: "Public",
    time: "8:30 AM",
    date: "Today",
    price: 77,
    spots: 2,
    rating: 4.4,
    holes: 18,
    cartIncluded: true,
    pace: "4h 00m",
    image:
      "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&w=1200&q=80",
    amenities: ["Player-friendly", "Patio", "Outings"],
    lat: 40.2898,
    lng: -74.1698,
  },
  {
    id: 27,
    course: "Charleston Springs North",
    city: "Millstone Township, NJ",
    distance: 0,
    access: "Public",
    time: "9:00 AM",
    date: "Tomorrow",
    price: 74,
    spots: 3,
    rating: 4.5,
    holes: 18,
    cartIncluded: true,
    pace: "4h 16m",
    image:
      "https://images.unsplash.com/photo-1592919505780-303950717480?auto=format&fit=crop&w=1200&q=80",
    amenities: ["Monmouth County", "36-hole facility", "Range"],
    lat: 40.1959,
    lng: -74.4292,
  },
  {
    id: 28,
    course: "Charleston Springs South",
    city: "Millstone Township, NJ",
    distance: 0,
    access: "Public",
    time: "10:30 AM",
    date: "Saturday",
    price: 72,
    spots: 4,
    rating: 4.4,
    holes: 18,
    cartIncluded: true,
    pace: "4h 12m",
    image:
      "https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&w=1200&q=80",
    amenities: ["Open routing", "County course", "Practice green"],
    lat: 40.1947,
    lng: -74.4318,
  },
  {
    id: 29,
    course: "Howell Park Golf Course",
    city: "Farmingdale, NJ",
    distance: 0,
    access: "Public",
    time: "12:00 PM",
    date: "Today",
    price: 66,
    spots: 2,
    rating: 4.2,
    holes: 18,
    cartIncluded: true,
    pace: "4h 14m",
    image:
      "https://images.unsplash.com/photo-1577906923414-6d2d79b1b724?auto=format&fit=crop&w=1200&q=80",
    amenities: ["County course", "Tree-lined", "Good value"],
    lat: 40.2095,
    lng: -74.1522,
  },
  {
    id: 30,
    course: "Shark River Golf Course",
    city: "Neptune, NJ",
    distance: 0,
    access: "Public",
    time: "1:30 PM",
    date: "Tomorrow",
    price: 61,
    spots: 4,
    rating: 4.0,
    holes: 18,
    cartIncluded: false,
    pace: "4h 06m",
    image:
      "https://images.unsplash.com/photo-1518602164578-cd0074062767?auto=format&fit=crop&w=1200&q=80",
    amenities: ["Classic layout", "Walkable", "County course"],
    lat: 40.2112,
    lng: -74.0736,
  },
  {
    id: 31,
    course: "Bel-Aire Golf Course",
    city: "Wall Township, NJ",
    distance: 0,
    access: "Public",
    time: "3:00 PM",
    date: "Saturday",
    price: 38,
    spots: 3,
    rating: 3.8,
    holes: 18,
    cartIncluded: false,
    pace: "3h 50m",
    image:
      "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=1200&q=80",
    amenities: ["Beginner friendly", "Executive options", "Low cost"],
    lat: 40.1542,
    lng: -74.0971,
  },
  {
    id: 32,
    course: "Pine Brook Golf Course",
    city: "Manalapan, NJ",
    distance: 0,
    access: "Public",
    time: "4:30 PM",
    date: "Today",
    price: 43,
    spots: 4,
    rating: 3.9,
    holes: 18,
    cartIncluded: false,
    pace: "3h 55m",
    image:
      "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&w=1200&q=80",
    amenities: ["County course", "Shorter layout", "Quick round"],
    lat: 40.2619,
    lng: -74.3301,
  },
  {
    id: 33,
    course: "Knob Hill Golf Club",
    city: "Manalapan, NJ",
    distance: 0,
    access: "Semi-private",
    time: "5:00 PM",
    date: "Tomorrow",
    price: 69,
    spots: 2,
    rating: 4.2,
    holes: 18,
    cartIncluded: true,
    pace: "4h 09m",
    image:
      "https://images.unsplash.com/photo-1592919505780-303950717480?auto=format&fit=crop&w=1200&q=80",
    amenities: ["Semi-private", "Dining", "Practice facility"],
    lat: 40.2894,
    lng: -74.3433,
  },
  {
    id: 34,
    course: "Old Bridge Golf Club at Rose-Lambertson",
    city: "Matawan, NJ",
    distance: 0,
    access: "Public",
    time: "6:30 AM",
    date: "Saturday",
    price: 59,
    spots: 3,
    rating: 4.1,
    holes: 18,
    cartIncluded: true,
    pace: "4h 02m",
    image:
      "https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&w=1200&q=80",
    amenities: ["Nearby option", "Playable layout", "Practice green"],
    lat: 40.4231,
    lng: -74.2705,
  },
  {
    id: 35,
    course: "Suneagles Golf Club",
    city: "Eatontown, NJ",
    distance: 0,
    access: "Public",
    time: "11:00 AM",
    date: "Tomorrow",
    price: 73,
    spots: 2,
    rating: 4.3,
    holes: 18,
    cartIncluded: true,
    pace: "4h 15m",
    image:
      "https://images.unsplash.com/photo-1577906923414-6d2d79b1b724?auto=format&fit=crop&w=1200&q=80",
    amenities: ["Historic property", "Hotel nearby", "Event venue"],
    lat: 40.3026,
    lng: -74.0555,
  },
  {
    id: 36,
    course: "Cream Ridge Golf Course",
    city: "Cream Ridge, NJ",
    distance: 0,
    access: "Public",
    time: "2:30 PM",
    date: "Saturday",
    price: 58,
    spots: 4,
    rating: 4.0,
    holes: 18,
    cartIncluded: true,
    pace: "4h 10m",
    image:
      "https://images.unsplash.com/photo-1518602164578-cd0074062767?auto=format&fit=crop&w=1200&q=80",
    amenities: ["Open fairways", "Value round", "Outings"],
    lat: 40.1246,
    lng: -74.5008,
  },
];

const toRadians = (value: number) => (value * Math.PI) / 180;

const getMilesBetween = (origin: Coordinates, destination: Coordinates) => {
  const earthRadiusMiles = 3958.8;
  const latDelta = toRadians(destination.lat - origin.lat);
  const lngDelta = toRadians(destination.lng - origin.lng);
  const startLat = toRadians(origin.lat);
  const endLat = toRadians(destination.lat);

  const a =
    Math.sin(latDelta / 2) ** 2 +
    Math.cos(startLat) * Math.cos(endLat) * Math.sin(lngDelta / 2) ** 2;

  return earthRadiusMiles * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const getMinutesFromTime = (time: string) => {
  const match = time.match(/^(\d{1,2}):(\d{2})\s(AM|PM)$/);
  if (!match) return 0;

  const [, hourText, minuteText, meridiem] = match;
  let hour = Number(hourText);
  const minutes = Number(minuteText);

  if (meridiem === "PM" && hour !== 12) hour += 12;
  if (meridiem === "AM" && hour === 12) hour = 0;

  return hour * 60 + minutes;
};

const formatTimeOption = (minutes: number) => {
  const hour24 = Math.floor(minutes / 60);
  const minute = minutes % 60;
  const meridiem = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 || 12;

  return `${hour12}:${String(minute).padStart(2, "0")} ${meridiem}`;
};

const timeOptions = Array.from({ length: 33 }, (_, index) => 5 * 60 + index * 30);

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

function App() {
  const [query, setQuery] = useState("Near me");
  const [origin, setOrigin] = useState<Coordinates>(defaultOrigin);
  const [locationName, setLocationName] = useState("Near me");
  const [locationStatus, setLocationStatus] = useState("Showing sample nearby courses");
  const [radius, setRadius] = useState(20);
  const [maxPrice, setMaxPrice] = useState(90);
  const [players, setPlayers] = useState(2);
  const [date, setDate] = useState("Any day");
  const [startTime, setStartTime] = useState(5 * 60);
  const [endTime, setEndTime] = useState(20 * 60 + 30);
  const [access, setAccess] = useState<"All" | Access>("All");
  const [memberMode, setMemberMode] = useState(false);
  const [selectedId, setSelectedId] = useState(teeTimes[0].id);
  const [geoLabel, setGeoLabel] = useState("Use my location");
  const [sortBy, setSortBy] = useState<SortBy>("distance");

  const teeTimesWithDistance = useMemo<SearchResult[]>(() => {
    return teeTimes
      .map((teeTime) => ({
        ...teeTime,
        currentDistance: Number(
          getMilesBetween(origin, { lat: teeTime.lat, lng: teeTime.lng }).toFixed(1),
        ),
      }))
      .sort((a, b) => a.currentDistance - b.currentDistance || a.price - b.price);
  }, [origin]);

  const filtered = useMemo(() => {
    return teeTimesWithDistance
      .filter((teeTime) => teeTime.currentDistance <= radius)
      .filter((teeTime) => teeTime.price <= maxPrice)
      .filter((teeTime) => teeTime.spots >= players)
      .filter((teeTime) => {
        const teeMinutes = getMinutesFromTime(teeTime.time);
        return teeMinutes >= startTime && teeMinutes <= endTime;
      })
      .filter((teeTime) => date === "Any day" || teeTime.date === date)
      .filter((teeTime) => access === "All" || teeTime.access === access)
      .filter((teeTime) => memberMode || teeTime.access !== "Private member")
      .sort((a, b) => {
        if (sortBy === "price") {
          return a.price - b.price || a.currentDistance - b.currentDistance;
        }

        return a.currentDistance - b.currentDistance || a.price - b.price;
      });
  }, [
    access,
    date,
    endTime,
    maxPrice,
    memberMode,
    players,
    radius,
    sortBy,
    startTime,
    teeTimesWithDistance,
  ]);

  const selected =
    teeTimesWithDistance.find((teeTime) => teeTime.id === selectedId) ?? teeTimesWithDistance[0];

  useEffect(() => {
    if (filtered.length && !filtered.some((teeTime) => teeTime.id === selectedId)) {
      setSelectedId(filtered[0].id);
    }
  }, [filtered, selectedId]);

  const applyOrigin = (coordinates: Coordinates, name: string, status: string) => {
    setOrigin(coordinates);
    setQuery(name);
    setLocationName(name);
    setLocationStatus(status);
  };

  const geocodeLocation = async (place: string) => {
    const normalized = place.trim().toLowerCase();
    if (!normalized || normalized === "near me") {
      setLocationStatus("Type a city or ZIP, or use current location");
      return;
    }

    const known = knownLocations[normalized];
    if (known) {
      applyOrigin(known, place.trim(), "Location matched");
      return;
    }

    setLocationStatus("Searching location...");

    try {
      const params = new URLSearchParams({
        q: place,
        format: "json",
        limit: "1",
        countrycodes: "us",
      });
      const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`);
      const results = (await response.json()) as Array<{
        lat: string;
        lon: string;
        display_name: string;
      }>;
      const first = results[0];

      if (!first) {
        setLocationStatus("Location not found");
        return;
      }

      applyOrigin(
        { lat: Number(first.lat), lng: Number(first.lon) },
        first.display_name.split(",").slice(0, 2).join(","),
        "Location matched",
      );
    } catch {
      setLocationStatus("Could not search that location");
    }
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void geocodeLocation(query);
  };

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setGeoLabel("Location unavailable");
      return;
    }

    setGeoLabel("Locating...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        applyOrigin(
          {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
          "Current location",
          "Using your browser location",
        );
        setGeoLabel("Location active");
      },
      () => {
        setGeoLabel("Enter ZIP or city");
        setLocationStatus("Location permission was not granted");
      },
      { enableHighAccuracy: true, timeout: 6000 },
    );
  };

  return (
    <main className="app-shell">
      <section className="hero">
        <div className="hero__media" aria-hidden="true" />
        <div className="topbar">
          <a className="brand" href="#" aria-label="Open Tee home">
            <span className="brand__mark">
              <Flag size={18} />
            </span>
            <span>Open Tee</span>
          </a>
          <nav className="topbar__nav" aria-label="Primary navigation">
            <a href="#search">Search</a>
            <a href="#member">Member access</a>
            <a href="#operators">For courses</a>
          </nav>
        </div>

        <div className="hero__content">
          <p className="eyebrow">Open tee times nearby</p>
          <h1>Find a foursome, twosome, or last-minute single without calling the pro shop.</h1>
          <p>
            Search public, semi-private, and verified member-only openings by location, budget,
            player count, date, and pace.
          </p>
        </div>
      </section>

      <section className="search-band" id="search" aria-label="Tee time search">
        <form className="search-panel" onSubmit={handleSearch}>
          <label className="field field--location">
            <span>
              <MapPin size={16} /> Location
            </span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="City, ZIP, or current location"
            />
            <small>{locationStatus}</small>
          </label>
          <button className="icon-text-button" type="button" onClick={requestLocation}>
            <LocateFixed size={18} />
            <span>{geoLabel}</span>
          </button>
          <label className="field">
            <span>
              <CalendarDays size={16} /> Date
            </span>
            <select value={date} onChange={(event) => setDate(event.target.value)}>
              <option>Any day</option>
              <option>Today</option>
              <option>Tomorrow</option>
              <option>Saturday</option>
            </select>
            <ChevronDown className="field__chevron" size={16} />
          </label>
          <button className="primary-button" type="submit">
            <Search size={18} />
            <span>Search</span>
          </button>
        </form>
      </section>

      <section className="workspace">
        <aside className="filters" aria-label="Search filters">
          <div className="section-title">
            <SlidersHorizontal size={18} />
            <h2>Filters</h2>
          </div>

          <label className="range-field">
            <span>Radius</span>
            <strong>{radius} mi</strong>
            <input
              type="range"
              min="5"
              max="50"
              step="5"
              value={radius}
              onChange={(event) => setRadius(Number(event.target.value))}
            />
          </label>

          <label className="range-field">
            <span>Max green fee</span>
            <strong>{formatCurrency(maxPrice)}</strong>
            <input
              type="range"
              min="35"
              max="150"
              step="5"
              value={maxPrice}
              onChange={(event) => setMaxPrice(Number(event.target.value))}
            />
          </label>

          <div className="time-window">
            <span>
              <Clock3 size={16} /> Tee time window
            </span>
            <div className="time-window__controls">
              <label className="field">
                <span>From</span>
                <select
                  value={startTime}
                  onChange={(event) => {
                    const nextStart = Number(event.target.value);
                    setStartTime(nextStart);
                    if (nextStart > endTime) setEndTime(nextStart);
                  }}
                >
                  {timeOptions.map((minutes) => (
                    <option value={minutes} key={minutes}>
                      {formatTimeOption(minutes)}
                    </option>
                  ))}
                </select>
                <ChevronDown className="field__chevron" size={16} />
              </label>
              <label className="field">
                <span>To</span>
                <select value={endTime} onChange={(event) => setEndTime(Number(event.target.value))}>
                  {timeOptions
                    .filter((minutes) => minutes >= startTime)
                    .map((minutes) => (
                      <option value={minutes} key={minutes}>
                        {formatTimeOption(minutes)}
                      </option>
                    ))}
                </select>
                <ChevronDown className="field__chevron" size={16} />
              </label>
            </div>
          </div>

          <div className="stepper" aria-label="Number of players">
            <span>
              <Users size={16} /> Players
            </span>
            <div>
              {[1, 2, 3, 4].map((count) => (
                <button
                  className={players === count ? "is-active" : ""}
                  type="button"
                  key={count}
                  onClick={() => setPlayers(count)}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>

          <label className="field">
            <span>
              <Filter size={16} /> Course access
            </span>
            <select value={access} onChange={(event) => setAccess(event.target.value as "All" | Access)}>
              <option>All</option>
              <option>Public</option>
              <option>Semi-private</option>
              <option>Private member</option>
            </select>
            <ChevronDown className="field__chevron" size={16} />
          </label>

          <label className="toggle" id="member">
            <input
              type="checkbox"
              checked={memberMode}
              onChange={(event) => setMemberMode(event.target.checked)}
            />
            <span />
            <strong>Show my private club openings</strong>
          </label>

          <div className="operator-note" id="operators">
            <ShieldCheck size={20} />
            <p>
              Course operators can publish live inventory, cancellation windows, resident rates, and
              member-only holds through an API later.
            </p>
          </div>
        </aside>

        <section className="results" aria-label="Available tee times">
          <div className="results__header">
            <div>
              <p>{filtered.length} matches near {locationName || "you"}</p>
              <p className="time-summary">
                {formatTimeOption(startTime)} to {formatTimeOption(endTime)}
              </p>
              <h2>Available tee times</h2>
            </div>
            <label className="sort-field">
              <span>
                <Crosshair size={15} /> Sort by
              </span>
              <select value={sortBy} onChange={(event) => setSortBy(event.target.value as SortBy)}>
                <option value="distance">Distance</option>
                <option value="price">Price</option>
              </select>
              <ChevronDown size={16} />
            </label>
          </div>

          <div className="tee-list">
            {filtered.length === 0 ? (
              <div className="empty-state">
                <Clock3 size={28} />
                <h3>No matching tee times</h3>
                <p>Try raising the price cap, expanding the radius, or lowering the player count.</p>
              </div>
            ) : (
              filtered.map((teeTime) => (
                <article
                  className={`tee-card ${selected.id === teeTime.id ? "is-selected" : ""}`}
                  key={teeTime.id}
                  onClick={() => setSelectedId(teeTime.id)}
                >
                  <img src={teeTime.image} alt={`${teeTime.course} fairway`} />
                  <div className="tee-card__body">
                    <div className="tee-card__top">
                      <div>
                        <p className="access-label">{teeTime.access}</p>
                        <h3>{teeTime.course}</h3>
                        <span>{teeTime.city} • {teeTime.currentDistance} mi away</span>
                      </div>
                      <strong>{formatCurrency(teeTime.price)}</strong>
                    </div>
                    <div className="tee-card__meta">
                      <span>
                        <Clock3 size={15} /> {teeTime.date}, {teeTime.time}
                      </span>
                      <span>
                        <Users size={15} /> {teeTime.spots} open
                      </span>
                      <span>
                        <Star size={15} /> {teeTime.rating}
                      </span>
                    </div>
                    <div className="amenities">
                      {teeTime.amenities.map((amenity) => (
                        <span key={amenity}>{amenity}</span>
                      ))}
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        <aside className="booking-panel" aria-label="Selected tee time">
          <div className="booking-panel__image">
            <img src={selected.image} alt={`${selected.course} course`} />
            <span>{selected.holes} holes</span>
          </div>
          <div className="booking-panel__body">
            <p className="access-label">{selected.access}</p>
            <h2>{selected.course}</h2>
            <p>{selected.city}</p>

            <div className="detail-grid">
              <span>
                <Clock3 size={16} />
                {selected.date} at {selected.time}
              </span>
              <span>
                <Users size={16} />
                {selected.spots} spots open
              </span>
              <span>
                <DollarSign size={16} />
                {formatCurrency(selected.price)} per player
              </span>
              <span>
                <Flag size={16} />
                Pace avg. {selected.pace}
              </span>
            </div>

            {selected.access === "Private member" ? (
              <button className="member-button" type="button">
                <LockKeyhole size={18} />
                Verify membership
              </button>
            ) : (
              <button className="reserve-button" type="button">
                <Check size={18} />
                Reserve tee time
              </button>
            )}

            <div className="map-preview" aria-label="Course map preview">
              <span className="map-pin" />
              <div>
                <strong>
                  {selected.currentDistance} mi from {locationName}
                </strong>
                <p>Distance updates when you search a city, ZIP, or use current location.</p>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
