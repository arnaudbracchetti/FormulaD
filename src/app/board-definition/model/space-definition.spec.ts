


import { SpaceDefinition, SpaceDefinitionImpl } from './space-definition';
describe('SpaceDefinition', () => {

    describe('straight() function', () => {

        it('should return undefined if there is no link', () => {
            let space = new SpaceDefinitionImpl('sp1', 0, 0);
            let link1 = new SpaceDefinitionImpl('link1', 80, 50);

            expect(space.straightLink()).toBeUndefined();

            space.addLink(link1);
            expect(space.straightLink()).not.toBeUndefined();

            space.removeLink(link1);
            expect(space.straightLink()).toBeUndefined();


        });

        it('should retrun the link closer to the space oriantation', () => {
            let space = new SpaceDefinitionImpl('sp1', 100, 100, 180);
            let link1 = new SpaceDefinitionImpl('link1', 80, 50); //right
            let link2 = new SpaceDefinitionImpl('link2', 90, 200); //left
            let link3 = new SpaceDefinitionImpl('link3', 70, 105); // straight

            space.addLink(link1);
            expect(space.straightLink()).toBe(link1);

            space.addLink(link2);
            expect(space.straightLink()).toBe(link1);

            space.addLink(link3);
            expect(space.straightLink()).toBe(link3);

        });
    });

});
