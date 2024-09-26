import * as React from 'react';
import { ComponentClass, FunctionComponent } from 'react';

import EventService from './event.service';

import { ModalBody } from '../common/modals/atoms/ModalAtoms';

type Modals = Array<{
    id: number;
    modal: React.ReactNode;
    closeModal: ({ isConfirmed }) => void;
    name: string;
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

        const wrapped = (
            <ModalBody
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
            ...this.modals,
            { id: this.id, modal: wrapped, closeModal: triggerClose, name: modalTemplate.name },
        ];

        this.event.trigger(this.modals);

        return promise.then(({ result, id: modalId }) => {
            this.modals = this.modals.filter(({ id }) => id !== modalId);
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
