import { FC, Dispatch, SetStateAction } from 'react';
import { Messages } from 'components/StructuredQuery/messages';
import { StructuredQuerySelection } from 'components/StructuredQuery/utils/structuredQueryInterfaces';
export interface AddRuleRowButtonProps {
    /**
     * text to display for the Add rule button
     */
    addRuleRowText: Messages['addRuleRowText'];
    /**
     * id of the group for the rule row to render
     */
    groupId: number;
    /**
     * state that represents the current rules and selections for the structured query
     */
    structuredQuerySelection: StructuredQuerySelection;
    /**
     * used to set the structuredQuerySelection state
     */
    setStructuredQuerySelection: Dispatch<SetStateAction<StructuredQuerySelection>>;
}
export declare const AddRuleRowButton: FC<AddRuleRowButtonProps>;
