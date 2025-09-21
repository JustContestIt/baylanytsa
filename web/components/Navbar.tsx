'use client';

import Link from 'next/link';
import ThemeToggle from './ThemeToggle';
import useSWR from 'swr';
import { api, fetcherJSON } from '@/lib/api';
import { Navbar, NavbarBrand, NavbarContent, NavbarItem } from '@heroui/navbar';
import { Button } from '@heroui/button';

export default function NavBar() {
  const { data: me } = useSWR(api('/me'), fetcherJSON);

  return (
    <Navbar>
      <NavbarBrand>
        <p className="font-bold text-inherit">Bailanysta</p>
      </NavbarBrand>
      <NavbarContent className="hidden sm:flex gap-4" justify="start">
        <NavbarItem>
          <Link color="foreground" href="/feed">
            Новости
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link aria-current="page" href="/notifications">
            Уведомления
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link color="foreground" href="/profile">
            Профиль
          </Link>
        </NavbarItem>
      </NavbarContent>
      <NavbarContent justify="end">
        <NavbarItem>
          {me ? (
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {me.displayName || me.username}
            </span>
          ) : (
            <Button as={Link} color="primary" href="/profile" variant="flat">
              Зарегистрироваться
            </Button>
          )}
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
}
