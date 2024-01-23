import { FC, Dispatch, SetStateAction } from 'react';
import { Messages } from 'components/StructuredQuery/messages';
import { StructuredQuerySelection } from 'components/StructuredQuery/utils/structuredQueryInterfaces';
export interface RemoveRuleRowButtonProps {
    /**
     * text to display for the Remove rule button icon description
     */
    removeRuleRowButtonIconDescription: Messages['removeRuleRowButtonIconDescription'];
    /**
     * id of the group for the rule row to render
     */
    groupId: number;
    /**
     * id of the rule row to remove
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
export declare const RemoveRuleRowButton: FC<RemoveRuleRowButtonProps>;
