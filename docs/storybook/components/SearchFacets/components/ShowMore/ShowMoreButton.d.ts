import { FC } from 'react';
import { Messages } from 'components/SearchFacets/messages';
interface ShowMoreButtonProps {
    /**
     * onClick handler to call for the Show more button
     */
    onClick: () => void;
    /**
     * Suffix to use for the button's data-testid
     */
    idSuffix: string;
    /**
     * If the button is expanded to show more or collapsed
     */
    isCollapsed: boolean;
    /**
     * If the button text will be for opening a modal or expanding the list
     */
    isShowAllMessage: boolean;
    /**
     * i18n messages for the component
     */
    messages: Messages;
}
export declare const ShowMoreButton: FC<ShowMoreButtonProps>;
export {};
