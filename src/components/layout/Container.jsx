export default function Container({ as: Tag = "div", className = "", children }) {
  return <Tag className={`w-full ${className}`}>{children}</Tag>;
}
