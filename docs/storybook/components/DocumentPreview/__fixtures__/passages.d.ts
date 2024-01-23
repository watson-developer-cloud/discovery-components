declare const passages: {
    single: {
        passage_text: string;
        start_offset: number;
        end_offset: number;
        field: string;
    };
    multiline: {
        passage_text: string;
        start_offset: number;
        end_offset: number;
        field: string;
    };
    answer: {
        passage_text: string;
        start_offset: number;
        end_offset: number;
        field: string;
    };
};
export default passages;
