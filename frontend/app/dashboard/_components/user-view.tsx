/* eslint-disable @next/next/no-img-element */

export default function UserView({
  name,
  image_url,
  email,
}: {
  name: string;
  image_url: string;
  email: string;
}) {
  return (
    <div className="flex items-center gap-3 bg-secondary p-3 rounded-lg border cursor-pointer hover:border-primary/35 duration-300 w-full">
      <img
        className="rounded-full aspect-square object-cover"
        src={image_url || "/placeholder-image.jpg"}
        width={40}
        height={40}
        alt={name}
      />
      <div>
        <div className="font-medium">{name}</div>
        <span className="text-muted-foreground mt-0.5 text-xs">{email}</span>
      </div>
    </div>
  );
}
