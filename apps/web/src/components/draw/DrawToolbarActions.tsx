import { Button } from "../ui/Button";

type DrawToolbarActionsProps = {
  showNewWord?: boolean;
  busy?: boolean;
  readOnly?: boolean;
  mustSave?: boolean;
  published?: boolean;
  onNewWord: () => void;
  onNewDrawing: () => void;
  onSave: () => void;
};

export function DrawToolbarActions({
  showNewWord = false,
  busy = false,
  readOnly = false,
  mustSave = false,
  published = false,
  onNewWord,
  onNewDrawing,
  onSave,
}: DrawToolbarActionsProps) {
  return (
    <div className="draw-toolbar-actions">
      {showNewWord ? (
        <Button
          label="Új szó"
          variant="ghost"
          onClick={onNewWord}
          disabled={busy || readOnly}
        />
      ) : null}
      <Button
        label="Új rajz"
        variant="ghost"
        onClick={onNewDrawing}
        disabled={busy || mustSave}
      />
      <Button
        label="Mentés"
        variant="primary"
        onClick={onSave}
        disabled={busy || published}
      />
    </div>
  );
}
