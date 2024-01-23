import { FC, Dispatch, SetStateAction } from 'react';
import { Messages } from 'components/StructuredQuery/messages';
import { StructuredQuerySelection } from 'components/StructuredQuery/utils/structuredQueryInterfaces';
export interface RuleRowProps {
    /**
     * override default messages for the component by specifying custom and/or internationalized text strings
     */
    messages: Messages;
    /**
     * id of the group for the rule row to render
     */
    groupId: number;
    /**
     * id of the rule row to render
     */
    rowId: number;
    /**
     * state that represents the current rules and selections for the structured query
     */
    structuredQuerySelection: StructuredQuerySelection;
    /**
     * used to set the structuredQuerySelection state
     */
    setStructuredQuerySelection: Dispatch<SetStateAction<StructuredQuerySelection>>;
}
export declare const RuleRow: FC<RuleRowProps>;
