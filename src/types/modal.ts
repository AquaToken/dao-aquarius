type ModalClose = () => void;
type ModalConfirm = (value?: unknown) => void;

export interface ModalProps<T> {
    confirm: ModalConfirm;
    close: ModalClose;
    params?: T;
}
