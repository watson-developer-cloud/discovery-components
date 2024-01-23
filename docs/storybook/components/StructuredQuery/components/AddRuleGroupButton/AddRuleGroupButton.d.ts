import { FC, Dispatch, SetStateAction } from 'react';
import { Messages } from 'components/StructuredQuery/messages';
import { StructuredQuerySelection } from 'components/StructuredQuery/utils/structuredQueryInterfaces';
export interface AddRuleGroupButtonProps {
    /**
     * text to display for the Add rule group button
     */
    addRuleGroupText: Messages['addRuleGroupText'];
    /**
     * state that represents the current rules and selections for the structured query
     */
    structuredQuerySelection: StructuredQuerySelection;
    /**
     * used to set the structuredQuerySelection state
     */
    setStructuredQuerySelection: Dispatch<SetStateAction<StructuredQuerySelection>>;
}
export declare const AddRuleGroupButton: FC<AddRuleGroupButtonProps>;
