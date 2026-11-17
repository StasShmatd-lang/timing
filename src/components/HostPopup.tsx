type Props = {
  text: string | null;
  onClose: () => void;
};

export function HostPopup({ text, onClose }: Props) {
  if (!text) return null;

  return (
    <aside className="host-popup" role="status">
      <img src="/brand/host-face.jpg" alt="Ведущий" />
      <div>
        <strong>Ведущий</strong>
        <p>{text}</p>
        <button
          type="button"
          className="btn btn-ghost"
          style={{ marginTop: "0.55rem", padding: "0.35rem 0.7rem" }}
          onClick={onClose}
        >
          Понятно
        </button>
      </div>
    </aside>
  );
}
