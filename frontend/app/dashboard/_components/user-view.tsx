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
    <div className="flex items-center gap-3">
      <img
        className="rounded-full aspect-square object-cover"
        src={image_url}
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
