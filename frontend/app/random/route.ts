import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/** Redirect to a random adoptable cat's detail page. */
export async function GET(request: Request) {
  try {
    const first = await fetch(`${API_BASE}/api/v1/cats?per_page=1`, {
      cache: "no-store",
    });
    const { total } = await first.json();

    if (total > 0) {
      const page = Math.floor(Math.random() * total) + 1;
      const res = await fetch(
        `${API_BASE}/api/v1/cats?per_page=1&page=${page}`,
        { cache: "no-store" },
      );
      const data = await res.json();
      const cat = data.cats?.[0];
      if (cat?.id) {
        return NextResponse.redirect(new URL(`/cats/${cat.id}`, request.url));
      }
    }
  } catch {
    // API unreachable — fall through to the catalog
  }
  return NextResponse.redirect(new URL("/cats", request.url));
}
