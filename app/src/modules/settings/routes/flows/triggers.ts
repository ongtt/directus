import { FIELD_TYPES_SELECT } from '@/constants';
import { translate } from '@/utils/translate-object-values';
import { DeepPartial, Field, FlowRaw, TriggerType, Width } from '@directus/shared/types';
import { toArray } from '@directus/shared/utils';
import { useI18n } from 'vue-i18n';
import { getPublicURL } from '../../../../utils/get-root-path';

export type Trigger = {
	name: string;
	id: TriggerType;
	icon: string;
	description: string;
	overview: (
		options: Record<string, any>,
		{ flow }: { flow: FlowRaw }
	) => { text: string; label: string; copyable?: boolean }[];
	options: DeepPartial<Field>[] | ((options: Record<string, any>) => DeepPartial<Field>[]);
};

export function getTriggers() {
	const { t } = useI18n();

	const triggers: Trigger[] = [
		{
			id: 'event',
			name: t('triggers.event.name'),
			icon: 'anchor',
			description: t('triggers.event.description'),
			overview: ({ type, scope, collections }) => {
				const labels = [
					{
						label: t('type'),
						text: type ?? '--',
					},
				];

				labels.push({
					label: t('scope'),
					text: scope && scope.length > 0 ? toArray(scope).join(', ') : '--',
				});

				labels.push({
					label: t('collections'),
					text: collections && collections.length > 0 ? toArray(collections).join(', ') : '--',
				});

				return labels;
			},
			options: ({ type, scope }) => {
				const fields = [
					{
						field: 'type',
						name: t('type'),
						meta: {
							interface: 'select-radio',
							options: {
								choices: [
									{
										text: t('triggers.event.filter'),
										value: 'filter',
									},
									{
										text: t('triggers.event.action'),
										value: 'action',
									},
								],
							},
						},
					},
				];

				const actionFields = [
					{
						field: 'scope',
						name: t('scope'),
						meta: {
							interface: 'select-multiple-dropdown',
							options: {
								placeholder: t('scope'),
								choices: [
									'items.create',
									'items.update',
									'items.delete',
									{ divider: true },
									'server.start',
									'server.stop',
									'response',
									'auth.login',
									'files.upload',
								],
								font: 'monospace',
							},
							width: 'full' as Width,
						},
					},
					{
						field: 'collections',
						name: t('collections'),
						type: 'csv',
						meta: {
							interface: 'system-collections',
							width: 'full' as Width,
							readonly:
								!scope || ['items.create', 'items.update', 'items.delete'].every((t) => scope?.includes(t) === false),
							options: {
								includeSystem: true,
							},
						},
					},
				];

				const filterFields = [
					{
						field: 'scope',
						name: t('scope'),
						meta: {
							interface: 'select-multiple-dropdown',
							options: {
								placeholder: t('scope'),
								choices: [
									'items.create',
									'items.update',
									'items.delete',
									{ divider: true },
									'request.not_found',
									'request.error',
									'database.error',
									'auth.login',
									'auth.jwt',
									'authenticate',
								],
								font: 'monospace',
							},
							width: 'full' as Width,
						},
					},
					{
						field: 'collections',
						name: t('collections'),
						meta: {
							interface: 'system-collections',
							width: 'full' as Width,
							readonly:
								!scope || ['items.create', 'items.update', 'items.delete'].every((t) => scope?.includes(t) === false),
							options: {
								includeSystem: true,
							},
						},
					},
					{
						field: 'return',
						name: t('triggers.common.response_body'),
						type: 'string',
						meta: {
							width: 'full',
							interface: 'select-radio',
							options: {
								choices: [
									{
										text: '$t:triggers.common.response_body_last',
										value: '$last',
									},
									{
										text: '$t:triggers.common.response_body_all',
										value: '$all',
									},
								],
								allowOther: true,
							},
						},
					},
				];

				if (type === 'action') {
					return [...fields, ...actionFields];
				}

				if (type === 'filter') {
					return [...fields, ...filterFields];
				}

				return fields;
			},
		},
		{
			id: 'webhook',
			name: t('triggers.webhook.name'),
			icon: 'link',
			description: t('triggers.webhook.description'),
			overview: ({ method }, { flow }) => [
				{
					label: t('method'),
					text: `${method ?? 'GET'}`,
				},
				{
					label: t('url'),
					text: `${getPublicURL()}flows/trigger/${flow.id}`,
					copyable: true,
				},
			],
			options: ({ async }) => [
				{
					field: 'method',
					name: t('triggers.webhook.method'),
					type: 'string',
					meta: {
						width: 'half',
						interface: 'select-dropdown',
						options: {
							choices: [
								{ text: 'GET', value: 'GET' },
								{ text: 'POST', value: 'POST' },
							],
						},
					},
					schema: {
						default_value: 'GET',
					},
				},
				{
					field: 'async',
					name: t('triggers.webhook.async'),
					type: 'boolean',
					meta: {
						width: 'half',
						interface: 'toggle',
						required: true,
					},
					schema: {
						default_value: false,
					},
				},
				{
					field: 'return',
					name: t('triggers.common.response_body'),
					type: 'string',
					schema: {
						default_value: '$last',
					},
					meta: {
						width: 'full',
						interface: 'select-radio',
						options: {
							choices: [
								{
									text: '$t:triggers.common.response_body_last',
									value: '$last',
								},
								{
									text: '$t:triggers.common.response_body_all',
									value: '$all',
								},
							],
							allowOther: true,
						},
						hidden: async,
					},
				},
			],
		},
		{
			id: 'schedule',
			name: t('triggers.schedule.name'),
			icon: 'schedule',
			description: t('triggers.schedule.description'),
			overview: ({ cron }) => [
				{
					label: t('triggers.schedule.cron'),
					text: cron,
				},
			],
			options: [
				{
					field: 'cron',
					name: t('triggers.schedule.cron'),
					type: 'string',
					meta: {
						width: 'full',
						interface: 'input',
						options: {
							placeholder: '* * 1 * * *',
						},
					},
				},
			],
		},
		{
			id: 'operation',
			name: t('triggers.operation.name'),
			icon: 'bolt',
			description: t('triggers.operation.description'),
			overview: () => [],
			options: [
				{
					field: 'return',
					name: t('triggers.common.response_body'),
					type: 'string',
					meta: {
						width: 'full',
						interface: 'select-radio',
						options: {
							choices: [
								{
									text: '$t:triggers.common.response_body_last',
									value: '$last',
								},
								{
									text: '$t:triggers.common.response_body_all',
									value: '$all',
								},
							],
							allowOther: true,
						},
					},
				},
			],
		},
		{
			id: 'manual',
			name: t('triggers.manual.name'),
			icon: 'touch_app',
			description: t('triggers.manual.description'),
			overview: ({ collections }) => {
				const labels = [
					{
						label: t('triggers.manual.description'),
						text: '',
					},
				];

				labels.push({
					label: t('collections'),
					text: collections ? toArray(collections).join(', ') : '--',
				});

				return labels;
			},
			options: [
				{
					field: 'collections',
					name: t('collections'),
					meta: {
						interface: 'system-collections',
						width: 'full' as Width,
					},
				},
				{
					field: 'async',
					name: t('triggers.webhook.async'),
					type: 'boolean',
					meta: {
						width: 'half' as Width,
						interface: 'toggle',
					},
					schema: {
						default_value: false,
					},
				},
				{
					field: 'location',
					name: t('location'),
					meta: {
						interface: 'select-dropdown',
						width: 'half' as Width,
						options: {
							choices: [
								{
									text: t('triggers.manual.collection_and_item'),
									value: 'both',
								},
								{
									text: t('triggers.manual.collection_only'),
									value: 'collection',
								},
								{
									text: t('triggers.manual.item_only'),
									value: 'item',
								},
							],
						},
					},
					schema: {
						default_value: 'both',
					},
				},
				{
					field: 'requireSelection',
					name: t('triggers.manual.collection_page'),
					type: 'boolean',
					meta: {
						interface: 'boolean',
						width: 'half' as Width,
						options: {
							label: t('triggers.manual.require_selection'),
						},
						hidden: false,
						conditions: [
							{
								rule: {
									location: {
										_eq: 'item',
									},
								},
								hidden: true,
							},
						],
					},
					schema: {
						default_value: true,
					},
				},
				{
					field: 'modal',
					type: 'alias',
					meta: {
						interface: 'presentation-divider',
						width: 'full',
						options: {
							title: t('confirmation_dialog'),
							icon: 'quiz',
						},
					},
				},
				{
					field: 'requireConfirmation',
					name: t('require_confirmation'),
					type: 'boolean',
					meta: {
						interface: 'boolean',
						width: 'full' as Width,
						options: {
							label: t('require_confirmation'),
						},
					},
					schema: {
						default_value: false,
					},
				},
				{
					field: 'confirmationDescription',
					name: t('confirmation_description'),
					type: 'string',
					meta: {
						interface: 'system-input-translated-string',
						options: {
							placeholder: '$t:run_flow_confirm',
						},
						conditions: [
							{
								rule: {
									requireConfirmation: {
										_eq: false,
									},
								},
								hidden: true,
							},
						],
					},
				},
				{
					field: 'fields',
					name: t('confirmation_input_fields'),
					type: 'json',
					meta: {
						interface: 'list',
						width: 'full',
						options: {
							template: '{{field}} – {{interface}}',
							fields: [
								{
									name: t('field_key'),
									field: 'field',
									type: 'string',
									meta: {
										interface: 'input',
										width: 'half',
										sort: 1,
										options: {
											dbSafe: true,
											font: 'monospace',
											placeholder: t('field_key_placeholder'),
										},
									},
									schema: null,
								},
								{
									name: t('field_name'),
									field: 'label',
									type: 'string',
									meta: {
										interface: 'system-input-translated-string',
										width: 'half',
										sort: 2,
										options: {
											placeholder: t('field_name_placeholder'),
										},
									},
									schema: null,
								},
								{
									name: t('type'),
									field: 'type',
									type: 'string',
									meta: {
										interface: 'select-dropdown',
										width: 'half',
										sort: 3,
										options: {
											choices: translate(FIELD_TYPES_SELECT),
										},
									},
									schema: null,
								},
								{
									name: t('interface_label'),
									field: 'interface',
									type: 'string',
									meta: {
										interface: 'system-interface',
										width: 'half',
										sort: 4,
										options: {
											typeField: 'type',
										},
									},
									schema: null,
								},
								{
									name: t('required'),
									field: 'required',
									type: 'boolean',
									meta: {
										interface: 'boolean',
										width: 'half',
										sort: 5,
										options: {
											label: t('required'),
										},
									},
									schema: {
										default_value: true,
									},
								},
								{
									name: t('note'),
									field: 'note',
									type: 'string',
									meta: {
										interface: 'system-input-translated-string',
										width: 'half',
										sort: 6,
										options: {
											placeholder: t('interfaces.list.field_note_placeholder'),
										},
									},
									schema: null,
								},
								{
									name: t('options'),
									field: 'options',
									type: 'string',
									meta: {
										interface: 'system-interface-options',
										width: 'full',
										sort: 7,
										options: {
											interfaceField: 'interface',
										},
									},
								},
							],
						},
						conditions: [
							{
								rule: {
									requireConfirmation: {
										_eq: false,
									},
								},
								hidden: true,
							},
						],
					},
				},
			],
		},
	];

	return { triggers };
}
