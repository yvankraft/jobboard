import Link from "next/link";
import { MapPin, Clock, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  CONTRACT_LABELS,
  REMOTE_LABELS,
} from "@/lib/constants";
import { timeAgo } from "@/lib/format";

type JobCardData = {
  slug: string;
  title: string;
  location: string;
  contract: string;
  remote: string;
  salaryMin: number | null;
  salaryMax: number | null;
  featured: boolean;
  publishedAt: Date | null;
  createdAt: Date;
  company: { name: string; slug: string; logoUrl: string | null };
  category: { name: string } | null;
};

export function JobCard({ job }: { job: JobCardData }) {
  const salary =
    job.salaryMin && job.salaryMax
      ? `${Math.round(job.salaryMin / 1000)}k–${Math.round(job.salaryMax / 1000)}k €`
      : null;
  return (
    <Link href={`/emplois/${job.slug}`} className="group">
      <Card className="h-full transition-shadow group-hover:shadow-md">
        <CardContent className="flex gap-4 p-5">
          <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted font-semibold">
            {job.company.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={job.company.logoUrl}
                alt=""
                className="size-full object-cover"
              />
            ) : (
              job.company.name.slice(0, 2).toUpperCase()
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate font-semibold group-hover:text-primary">
                {job.title}
              </h3>
              {job.featured && (
                <Star className="size-4 shrink-0 fill-primary text-primary" />
              )}
            </div>
            <p className="text-sm text-muted-foreground">{job.company.name}</p>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="size-3.5" /> {job.location}
              </span>
              <Badge variant="secondary">{CONTRACT_LABELS[job.contract]}</Badge>
              <Badge variant="outline">{REMOTE_LABELS[job.remote]}</Badge>
              {salary && <span className="font-medium">{salary}</span>}
            </div>
          </div>
          <div className="flex shrink-0 items-start text-xs text-muted-foreground">
            <Clock className="mr-1 size-3.5" />
            {timeAgo(job.publishedAt ?? job.createdAt)}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
