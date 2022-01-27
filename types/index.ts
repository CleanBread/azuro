export type TNullable<T> = T | null;
export type TOptionable<T> = T | undefined;

export enum FORM_TYPE {
  WITH_APPROVE = 'WITH_APPROVE',
  WITHOUT_APPROVE = 'WITHOUT_APPROVE',
}

export interface AllFormProps {
  title: string;
  amount: string;
  name: string;
  handleChangeAmount: (e: React.ChangeEvent<HTMLInputElement>) => void;
  inputTitleText: string;
  btnText: string;
  available: string;
  handleSubmit: () => void;
  isLoading: boolean;
  isApproved?: boolean;
  handleApprove?: () => void;
}

export type FormWithApproveProps = {
  type: FORM_TYPE.WITH_APPROVE;
  isApproved: boolean;
  handleApprove: () => void;
} & AllFormProps;

export type FormWithoutApproveProps = {
  type: FORM_TYPE.WITHOUT_APPROVE;
} & AllFormProps;

export interface ITxTableItem {
  data: number;
  action: string;
  sender: string;
  amount: string;
}

export type SelectedModeProps = FormWithoutApproveProps | FormWithApproveProps;
