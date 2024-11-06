import * as React from 'react';
import { ComponentClass, FunctionComponent } from 'react';

import { ModalBody } from 'components/ModalBody';

import EventService from './event.service';

export type Modals = Array<{
    id: number;
    modal: React.ReactNode;
    closeModal: ({ isConfirmed }) => void;
    name: string;
    state: { isActive: boolean };
}>;
export default class ModalServiceClass {
    modals: Modals = [];
    id = 0;
    event: EventService = new EventService();

    openModal<T>(
        modalTemplate:
            | FunctionComponent<unknown>
            | ComponentClass<unknown>
            | ((value: unknown) => React.ReactNode),
        params: unknown,
        hideClose = false,
        backgroundImage = null,
        disableClickOutside = false,
    ): Promise<T> {
        this.id += 1;
        let resolver: (value: unknown) => void = undefined;

        const promise = new Promise(resolve => {
            const id = this.id;
            resolver = data => {
                resolve({ id, result: data });
            };
        });

        const modalTemplateElement = React.createElement(modalTemplate);

        let triggerClose: (value: unknown) => void = undefined;

        const triggerClosePromise = new Promise(resolve => {
            triggerClose = resolve;
        });

        const state = { isActive: true };

        const wrapped = (
            <ModalBody
                state={state}
                resolver={resolver}
                params={params}
                key={this.id}
                hideClose={hideClose}
                triggerClosePromise={triggerClosePromise}
                backgroundImage={backgroundImage}
                disableClickOutside={disableClickOutside}
            >
                {
                    modalTemplateElement as React.DetailedReactHTMLElement<
                        React.HTMLAttributes<HTMLElement>,
                        HTMLElement
                    >
                }
            </ModalBody>
        );

        this.modals = [
            ...this.modals.map(modal => {
                modal.state.isActive = false;
                return modal;
            }),
            {
                id: this.id,
                modal: wrapped,
                closeModal: triggerClose,
                name: modalTemplate.name,
                state,
            },
        ];

        this.event.trigger(this.modals);

        return promise.then(({ result, id: modalId }) => {
            const newModals = this.modals.filter(({ id }) => id !== modalId);

            this.modals = newModals.map((modal, index) => {
                modal.state.isActive = index === newModals.length - 1;
                return modal;
            });
            this.event.trigger(this.modals);
            return result;
        });
    }

    closeAllModals(): void {
        if (!this.modals.length) {
            return;
        }

        this.modals.forEach(({ closeModal }) => {
            closeModal({ isConfirmed: false });
        });
    }

    confirmAllModals(): void {
        if (!this.modals.length) {
            return;
        }

        this.modals.forEach(({ closeModal }) => {
            closeModal({ isConfirmed: true });
        });
    }

    closeModal(modalName: string) {
        const modal = this.modals.find(({ name }) => name === modalName);

        modal?.closeModal({ isConfirmed: false });
    }

    confirmModal(modalName: string) {
        const modal = this.modals.find(({ name }) => name === modalName);

        modal?.closeModal({ isConfirmed: true });
    }
}
