import * as React from 'react';
import * as renderer from 'react-test-renderer';
import App from '../AquaVote/components/App';
import { ReactTestRenderer, ReactTestRendererJSON } from 'react-test-renderer';

it('App is rendered', () => {
    // Render App in the document
    const component: ReactTestRenderer = renderer.create(<App />);
    const tree: ReactTestRendererJSON | ReactTestRendererJSON[] = component.toJSON();
    expect(tree).toMatchSnapshot();
});
