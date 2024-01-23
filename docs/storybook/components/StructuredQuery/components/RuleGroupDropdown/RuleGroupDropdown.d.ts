import { FC, Dispatch, SetStateAction } from 'react';
import { Messages } from 'components/StructuredQuery/messages';
import { StructuredQuerySelection } from 'components/StructuredQuery/utils/structuredQueryInterfaces';
export interface RuleGroupDropdownProps {
    /**
     * override default messages for the component by specifying custom and/or internationalized text strings
     */
    messages: Messages;
    /**
     * state that represents the current rules and selections for the structured query
     */
    structuredQuerySelection: StructuredQuerySelection;
    /**
     * used to set the structuredQuerySelection state
     */
    setStructuredQuerySelection: Dispatch<SetStateAction<StructuredQuerySelection>>;
    /**
     * id of the group for the rule group dropdown
     */
    groupId: number;
}
export declare const RuleGroupDropdown: FC<RuleGroupDropdownProps>;
